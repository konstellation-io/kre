import asyncio
import datetime
import importlib.util
import json
import logging
import os
import sys
import traceback

from nats.aio.client import ErrTimeout, Client as NATS


class Config:
    def __init__(self):
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
        except Exception as err:
            raise Exception(f"error reading config: the {str(err)} env var is missing")


class HandlerContext:
    ERR_MISSING_VALUES = "missing_values"
    ERR_NEW_LABELS = "new_labels"

    def __init__(self, config, nc, logger):
        self.__config__ = config
        self.__nc__ = nc
        self.logger = logger
        self.METRIC_ERRORS = [self.ERR_MISSING_VALUES, self.ERR_NEW_LABELS]

    def get_path(self, relative_path):
        return os.path.join(self.__config__.base_path, relative_path)

    def set_value(self, key, value):
        setattr(self, key, value)

    def get_value(self, key):
        return getattr(self, key)

    async def save_metric(self, predicted_value="", true_value="", date="", error=""):
        if error != "":
            if error not in self.METRIC_ERRORS:
                raise Exception(f"[ctx.save_metric] invalid value for metric error {error} "
                                f"should be one of '{','.join(self.METRIC_ERRORS)}'")
        else:
            if not isinstance(predicted_value, str) or predicted_value == "":
                raise Exception(f"[ctx.save_metric] invalid 'predicted_value'='{predicted_value}',"
                                f" must be a nonempty string")
            if not isinstance(true_value, str) or true_value == "":
                raise Exception(f"[ctx.save_metric] invalid 'true_value'='{true_value}', must be a nonempty string")

        if date == "":
            d = datetime.datetime.utcnow()
            date = d.isoformat("T") + "Z"
        else:
            try:
                datetime.datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ")
            except ValueError:
                raise Exception(f"[ctx.save_metric] invalid 'date'='{date}', must be a RFC 3339 date like: "
                                "2020-04-06T09:02:09.277853Z")

        coll = "classificationMetrics"
        doc = {
            "date": date,
            "error": error,
            "predictedValue": predicted_value,
            "trueValue": true_value,
            "versionId": self.__config__.krt_version_id,
            "versionName": self.__config__.krt_version
        }

        try:
            subject = self.__config__.nats_mongo_writer
            payload = bytes(json.dumps({"coll": coll, "doc": doc}), encoding='utf-8')
            response = await self.__nc__.request(subject, payload, timeout=1)
            res_json = json.loads(response.data.decode())
            if not res_json['success']:
                self.logger.error("Unexpected error saving metric")
        except ErrTimeout:
            self.logger.error("Error saving metric: request timed out")


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

    def to_json(self):
        return bytes(json.dumps(self.__dict__), encoding='utf-8')


class Runner:
    def __init__(self):
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s %(levelname)s %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%S%z"
        )
        logging.addLevelName(logging.DEBUG, 'DEBUG')
        logging.addLevelName(logging.WARNING, 'WARN')
        logging.addLevelName(logging.FATAL, 'ERROR')
        logging.addLevelName(logging.CRITICAL, 'ERROR')

        self.logger = logging.getLogger("kre-runner")
        self.config = Config()
        self.loop = asyncio.get_event_loop()
        self.nc = NATS()
        self.subscription_sid = None

    def start(self):
        try:
            asyncio.ensure_future(self.process_messages())
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

    async def process_messages(self):
        self.logger.info(f"connecting to NATS at '{self.config.nats_server}'")
        await self.nc.connect(self.config.nats_server, loop=self.loop)

        handler_module = self.load_handler_module()
        ctx = self.create_handler_ctx(handler_module)

        queue_name = f"queue_{self.config.nats_input}"
        self.logger.info(f"listening to '{self.config.nats_input}' subject with queue '{queue_name}'")

        self.subscription_sid = await self.nc.subscribe(
            self.config.nats_input,
            cb=self.create_message_cb(handler_module, ctx),
            queue=queue_name
        )

    def load_handler_module(self):
        handler_full_path = os.path.join(self.config.base_path, self.config.handler_path)
        handler_dirname = os.path.dirname(handler_full_path)
        sys.path.append(handler_dirname)
        spec = importlib.util.spec_from_file_location("worker", handler_full_path)
        handler_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(handler_module)

        if not hasattr(handler_module, "handler"):
            raise Exception(f"the handler module '{handler_full_path}' must implement a function 'handler(ctx, data)'")
        else:
            self.logger.info(f"the handler script was loaded from '{handler_full_path}'")

        return handler_module

    def create_handler_ctx(self, handler_module):
        ctx = HandlerContext(self.config, self.nc, self.logger)
        if hasattr(handler_module, "init"):
            handler_module.init(ctx)

        return ctx

    def create_message_cb(self, handler_module, ctx):
        async def message_cb(msg):
            result = Result()
            result.from_nats_msg(msg)

            if msg.reply == "" and result.reply == "":
                raise Exception("the reply subject was not found")

            if msg.reply != "":
                result.reply = msg.reply

            self.logger.info(f"received a message on '{msg.subject}' with final reply '{result.reply}'")

            try:
                handler_result = await handler_module.handler(ctx, result.data)

                is_last_node = self.config.nats_output == ''
                output_subject = result.reply if is_last_node else self.config.nats_output
                output_result = Result(reply=result.reply, data=handler_result)

                await self.nc.publish(output_subject, output_result.to_json())
                self.logger.info(f"published response to '{output_subject}' subject with final reply '{result.reply}'")

            except Exception as err:
                traceback.print_exc()
                self.logger.error("error executing handler:" + str(err))
                output_result = Result(error=f"error in '{self.config.krt_node_name}': {str(err)}")
                await self.nc.publish(result.reply, output_result.to_json())

        return message_cb


if __name__ == '__main__':
    runner = Runner()
    runner.start()
