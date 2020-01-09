import logging
import os
import asyncio
import importlib.util
import json

from nats.aio.client import Client as NATS


class Config:
    def __init__(self):
        try:
            self.krt_version = os.environ['KRT_VERSION']
            self.krt_node_name = os.environ['KRT_NODE_NAME']
            self.nats_server = os.environ['KRT_NATS_SERVER']
            self.nats_input = os.environ['KRT_NATS_INPUT']
            self.nats_output = os.environ['KRT_NATS_OUTPUT']
            self.nats_mongo_writer = os.environ['KRT_NATS_MONGO_WRITER']
            self.base_path = os.environ['KRT_BASE_PATH']
            self.handler_path = os.environ['KRT_HANDLER_PATH']
        except Exception as err:
            raise Exception(f"error reading config: the {str(err)} env var is missing")


class HandlerContext:
    def __init__(self, config, write_in_mongo):
        self.__base_path__ = config.base_path
        self.__write_in_mongo__ = write_in_mongo

    def get_path(self, relative_path):
        return os.path.join(self.__base_path__, relative_path)

    def set_value(self, key, value):
        setattr(self, key, value)

    def get_value(self, key):
        return getattr(self, key)

    def save_metric(self, key, value):
        coll = "metrics"
        doc = {
            "key": key,
            "value": value
        }

        self.__write_in_mongo__({"coll": coll, "doc": doc})


class Result:
    def __init__(self, reply='', data=None, error=None):
        self.reply = reply
        self.data = data
        self.error = error

    def from_nats_msg(self, msg):
        try:
            data = json.loads(msg.data.decode())
        except Exception as err:
            raise Exception(f"error parsing msg.data because is not a valid JSON: {str(err)}")

        self.reply = data.get("reply")
        self.data = data.get("data")
        self.error = data.get("error")

    def to_dict(self):
        return {
            "reply": self.reply,
            "data": self.data,
            "error": self.error
        }

    def to_json(self):
        return bytes(json.dumps(self.to_dict()), encoding='utf-8')


class App:
    def __init__(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("kre-runner")
        self.config = Config()
        self.loop = asyncio.get_event_loop()
        self.nc = NATS()
        self.subscription_sid = None

    def start(self):
        try:
            asyncio.ensure_future(self.run())
            # loop.set_exception_handler(handle_exception)
            self.loop.run_forever()
        except KeyboardInterrupt:
            self.logger.info("process interrupted")
        finally:
            self.loop.run_until_complete(self.stop())
            self.logger.info("closing loop")
            self.loop.close()

    async def stop(self):
        if self.subscription_sid is not None:
            self.logger.info(f"unsubscribe from sid '{self.subscription_sid}'")
            await self.nc.unsubscribe(self.subscription_sid)

        if not self.nc.is_closed:
            self.logger.info("closing NATS connection")
            await self.nc.close()

        self.logger.info("stop loop")
        self.loop.stop()

    async def run(self):
        self.logger.info(f"connecting to NATS at '{self.config.nats_server}'")
        await self.nc.connect(self.config.nats_server, loop=self.loop)

        handler_module = self.load_handler_module()
        ctx = self.create_handler_ctx(handler_module)

        self.logger.info(f"listening to '{self.config.nats_input}' subject")
        self.subscription_sid = await self.nc.subscribe(
            self.config.nats_input, cb=self.create_message_cb(handler_module, ctx))

    def load_handler_module(self):
        handler_full_path = os.path.join(self.config.base_path, self.config.handler_path)
        spec = importlib.util.spec_from_file_location("worker", handler_full_path)
        handler_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(handler_module)

        if not hasattr(handler_module, "handler"):
            raise Exception(f"the handler module '{handler_full_path}' must implement a function 'handler(ctx, data)'")
        else:
            self.logger.info(f"the handler script was loaded from '{handler_full_path}'")

        return handler_module

    def create_handler_ctx(self, handler_module):
        def write_in_mongo(msg):
            coro = self.nc.publish(self.config.nats_mongo_writer, bytes(json.dumps(msg), encoding='utf-8'))
            self.loop.create_task(coro)

        ctx = HandlerContext(self.config, write_in_mongo)
        if hasattr(handler_module, "init"):
            handler_module.init(ctx)

        return ctx

    def create_message_cb(self, handler_module, ctx):
        async def message_cb(msg):
            self.logger.info(f"received a message on '{msg.subject}' with reply '{msg.reply}'")

            result = Result()
            result.from_nats_msg(msg)

            if msg.reply == "" and result.reply == "":
                raise Exception("the reply subject was not found")

            if msg.reply != "":
                result.reply = msg.reply

            try:
                handler_result = handler_module.handler(ctx, result.data)

                is_last_node = self.config.nats_output == ''
                output_subject = result.reply if is_last_node else self.config.nats_output
                output_result = Result(reply=result.reply, data=handler_result)

                self.logger.info(f"publish response to '{output_subject}' subject")
                await self.nc.publish(output_subject, output_result.to_json())

            except Exception as err:
                self.logger.error("error executing handler:" + str(err))
                output_result = Result(error=f"error in '{self.config.krt_node_name}': {str(err)}")
                await self.nc.publish(result.reply, output_result.to_json())

        return message_cb


if __name__ == '__main__':
    app = App()
    app.start()
