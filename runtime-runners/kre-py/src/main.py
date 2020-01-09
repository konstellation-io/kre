import sys
import os
import asyncio
import importlib.util
import json

from nats.aio.client import Client as NATS


class HandlerContext:
  def __init__(self, cfg, write_in_mongo):
    self.__base_path__ = cfg["base_path"]
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


def load_config_from_env_vars():
  try:
    return {
      "krt_version": os.environ['KRT_VERSION'],
      "nats_server": os.environ['KRT_NATS_SERVER'],
      "nats_input": os.environ['KRT_NATS_INPUT'],
      "nats_output": os.environ['KRT_NATS_OUTPUT'],
      "nats_mongo_writer": os.environ['KRT_NATS_MONGO_WRITER'],
      "base_path": os.environ['KRT_BASE_PATH'],
      "handler_path": os.environ['KRT_HANDLER_PATH']
    }
  except KeyError as err:
    print(f"Error reading config: the {str(err)} env var is missing")
    sys.exit(1)


def load_handler_module(config):
  handler_full_path = os.path.join(config["base_path"], config["handler_path"])
  spec = importlib.util.spec_from_file_location("worker", handler_full_path)
  handler_module = importlib.util.module_from_spec(spec)
  spec.loader.exec_module(handler_module)
  return handler_module


async def run(config, loop):
  print("Connecting to NATS...")
  nc = NATS()
  await nc.connect(config["nats_server"], loop=loop)

  handler_module = load_handler_module(config)

  def write_in_mongo(msg):
    coro = nc.publish(config["nats_mongo_writer"], bytes(json.dumps(msg), encoding='utf-8'))
    loop.create_task(coro)

  ctx = HandlerContext(config, write_in_mongo)
  handler_module.init(ctx)  # TODO check if init func exists

  async def message_callback(msg):
    subject = msg.subject
    reply = msg.reply
    data = msg.data.decode()
    print("Received a message on '{subject} {reply}': {data}".format(
      subject=subject, reply=reply, data=data))

    try:
      data_json = json.loads(data)

      if reply == '' and data_json['reply'] == '':
        raise Exception('Reply not found')

      handler_result = handler_module.handler(ctx, data_json['result'])

      if reply != '':
        data_json['reply'] = reply

      if config['nats_output'] == '':
        subject = data_json['reply']
      else:
        subject = config["nats_output"]

      output_result = {
        'reply': data_json['reply'],
        'result': handler_result
      }

      print("Publishing response...")
      await nc.publish(subject, bytes(json.dumps(output_result), encoding='utf-8'))

    except Exception as err:
      print("Error executing handler:" + str(err))

  print(f"Listening to {config['nats_input']} channel...")
  await nc.subscribe(config["nats_input"], cb=message_callback)


if __name__ == '__main__':
  config = load_config_from_env_vars()

  loop = asyncio.get_event_loop()
  try:
    asyncio.ensure_future(run(config, loop))
    loop.run_forever()
  finally:
    print("Closing Loop")
    loop.close()
