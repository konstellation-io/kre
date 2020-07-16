import asyncio
import datetime
import importlib.util
import os
import sys
import time
import traceback
import pymongo
import inspect

from kre_nats import KreNatsMessage
from kre_context import HandlerContext
from kre_runner import Runner

NATS_FLUSH_TIMEOUT = 10


class Config:
    def __init__(self):
        # Mandatory variables
        try:
            self.krt_version_id = os.environ['KRT_VERSION_ID']
            self.krt_version = os.environ['KRT_VERSION']
            self.krt_node_name = os.environ['KRT_NODE_NAME']
            self.nats_server = os.environ['KRT_NATS_SERVER']
            self.nats_input = os.environ['KRT_NATS_INPUT']
            self.nats_output = os.environ['KRT_NATS_OUTPUT']
            self.nats_mongo_writer = os.environ['KRT_NATS_MONGO_WRITER']
            self.base_path = os.environ['KRT_BASE_PATH']
            self.handler_path = os.environ['KRT_HANDLER_PATH']
            self.mongo_db_name = os.environ['KRT_MONGO_DB_NAME']
            self.mongo_uri = os.environ['KRT_MONGO_URI']
            self.nats_flush_timeout = NATS_FLUSH_TIMEOUT

        except Exception as err:
            raise Exception(f"error reading config: the {str(err)} env var is missing")


class NodeRunner(Runner):
    def __init__(self):
        config = Config()
        name = f"{config.krt_version}-{config.krt_node_name}"
        Runner.__init__(self, name, config)

        try:
            self.load_handler()
        except SyntaxError as err:
            traceback.print_exc()
            self.logger.error(f"syntax error loading handler script: {err}")
            sys.exit(1)

    async def process_messages(self):
        self.logger.info(f"connecting to MongoDB...")
        self.mongo_conn = pymongo.MongoClient(self.config.mongo_uri, socketTimeoutMS=10000, connectTimeoutMS=10000)

        queue_name = f"queue_{self.config.nats_input}"
        self.logger.info(f"listening to '{self.config.nats_input}' subject with queue '{queue_name}'")

        self.subscription_sid = await self.nc.subscribe(
            self.config.nats_input,
            cb=self.create_message_cb(),
            queue=queue_name
        )

        self.execute_handler_init()

    def load_handler(self):
        handler_full_path = os.path.join(self.config.base_path, self.config.handler_path)
        handler_dirname = os.path.dirname(handler_full_path)
        sys.path.append(handler_dirname)

        spec = importlib.util.spec_from_file_location("worker", handler_full_path)
        handler_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(handler_module)
        
        if not hasattr(handler_module, "handler"):
            raise Exception(f"handler module '{handler_full_path}' must implement a function 'handler(ctx, data)'")
        else:
            self.logger.info(f"handler script was loaded from '{handler_full_path}'")

        self.handler_fn = handler_module.handler

        if hasattr(handler_module, "init"):
            self.handler_init_fn = handler_module.init

    async def execute_handler_init(self):
        self.handler_ctx = HandlerContext(self.config, self.nc, self.mongo_conn, self.logger)

        if not self.handler_init_fn:
            return

        if inspect.iscoroutinefunction(self.handler_init_fn):
            await asyncio.create_task(self.handler_init_fn(self.handler_ctx))
        else:
            self.handler_init_fn(self.handler_ctx)

    def create_message_cb(self):
        async def message_cb(msg):
            start = time.time()
            try:
                request_msg = KreNatsMessage(msg=msg)

                if msg.reply == "" and request_msg.reply == "":
                    raise Exception("the reply subject was not found")

                if msg.data is None:
                    raise Exception("message data can't be null")

                if msg.reply != "":
                    request_msg.reply = msg.reply

                self.logger.info(f"received message on '{msg.subject}' with final reply '{request_msg.reply}'")

                handler_result = await self.handler_fn(self.handler_ctx, request_msg.data)

                is_last_node = self.config.nats_output == ''
                output_subject = request_msg.reply if is_last_node else self.config.nats_output
                response_msg = KreNatsMessage(reply=request_msg.reply, data=handler_result)

                await self.nc.publish(output_subject, response_msg.marshal())
                self.logger.info(f"published response to '{output_subject}' with final reply '{request_msg.reply}'")

                await self.nc.flush(timeout=self.config.nats_flush_timeout)

                end = time.time()
                self.logger.info(f"version[{self.handler_ctx.__config__.krt_version}] "
                                 f"node[{self.handler_ctx.__config__.krt_node_name}] "
                                 f"reply[{request_msg.reply}] "
                                 f"start[{datetime.datetime.utcfromtimestamp(start).isoformat()}] "
                                 f"end[{datetime.datetime.utcfromtimestamp(end).isoformat()}] "
                                 f"elapsed[{round(end - start, 2)}]"
                                 )

            except Exception as err:
                traceback.print_exc()
                self.logger.error("error executing handler:" + str(err))
                response_msg = KreNatsMessage(error=f"error in '{self.config.krt_node_name}': {str(err)}")
                await self.nc.publish(request_msg.reply, response_msg.marshal())

        return message_cb


if __name__ == '__main__':
    runner = NodeRunner()
    runner.start()
