import asyncio
from datetime import datetime
import importlib.util
import os
import sys
import traceback
import pymongo
import inspect

from kre_nats import KreNatsMessage
from context import HandlerContext
from kre_runner import Runner
from config import Config


class NodeRunner(Runner):
    def __init__(self):
        config = Config()
        name = f"{config.krt_version}-{config.krt_node_name}"
        Runner.__init__(self, name, config)
        self.handler_ctx = None
        self.handler_init_fn = None
        self.handler_fn = None
        self.mongo_conn = None
        self.load_handler()

    def load_handler(self):
        self.logger.info(f"loading handler script {self.config.handler_path}...")

        handler_full_path = os.path.join(self.config.base_path, self.config.handler_path)
        handler_dirname = os.path.dirname(handler_full_path)
        sys.path.append(handler_dirname)

        try:
            spec = importlib.util.spec_from_file_location("worker", handler_full_path)
            handler_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(handler_module)
        except Exception as err:
            tb = traceback.format_exc()
            self.logger.error(f"error loading handler script {self.config.handler_path}: {err}\n\n{tb}")
            sys.exit(1)

        if not hasattr(handler_module, "handler"):
            raise Exception(f"handler module '{handler_full_path}' must implement a function 'handler(ctx, data)'")
        
        if hasattr(handler_module, "init"):
            self.handler_init_fn = handler_module.init

        self.handler_fn = handler_module.handler
        self.logger.info(f"handler script was loaded from '{handler_full_path}'")

    async def process_messages(self):
        self.logger.info(f"connecting to MongoDB...")
        self.mongo_conn = pymongo.MongoClient(self.config.mongo_uri, socketTimeoutMS=10000, connectTimeoutMS=10000)

        queue_name = f"queue_{self.config.nats_input}"
        self.subscription_sid = await self.nc.subscribe(
            self.config.nats_input,
            cb=self.create_message_cb(),
            queue=queue_name
        )
        self.logger.info(f"listening to '{self.config.nats_input}' subject with queue '{queue_name}'")

        await self.execute_handler_init()

    async def execute_handler_init(self):
        self.logger.info(f"creating handler context...")
        self.handler_ctx = HandlerContext(self.config, self.nc, self.mongo_conn, self.logger)

        if not self.handler_init_fn:
            return

        self.logger.info(f"executing handler init...")
        if inspect.iscoroutinefunction(self.handler_init_fn):
            await asyncio.create_task(self.handler_init_fn(self.handler_ctx))
        else:
            self.handler_init_fn(self.handler_ctx)

    def create_message_cb(self):
        async def message_cb(msg):
            start = datetime.utcnow().isoformat()
            request_msg = KreNatsMessage(msg=msg)

            try:
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
                response_msg = KreNatsMessage(
                    reply=request_msg.reply,
                    data=handler_result,
                    tracking_id=request_msg.tracking_id,
                    tracking=request_msg.tracking
                )

                end = datetime.utcnow().isoformat()
                response_msg.tracking.append({"node_name": self.config.krt_node_name, "start": start, "end": end})

                await self.nc.publish(output_subject, response_msg.marshal())
                self.logger.info(f"published response to '{output_subject}' with final reply '{request_msg.reply}'")

                await self.nc.flush(timeout=self.config.nats_flush_timeout)

                cfg = self.handler_ctx.__config__


            except Exception as err:
                tb = traceback.format_exc()
                self.logger.error(f"error executing handler: {err} \n\n{tb}")
                response_msg = KreNatsMessage(error=f"error in '{self.config.krt_node_name}': {str(err)}")
                await self.nc.publish(request_msg.reply, response_msg.marshal())

        return message_cb


if __name__ == '__main__':
    runner = NodeRunner()
    runner.start()
