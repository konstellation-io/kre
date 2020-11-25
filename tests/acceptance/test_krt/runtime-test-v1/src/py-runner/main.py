from public_input_pb2 import Message


async def init(ctx):
    ctx.logger.info("[py-runner] init")


async def handler(ctx, data) -> Message:
    ctx.logger.info("[py-runner] handler")
    msg = Message()
    data.Unpack(msg)

    msg.py_runner_success = True
    return msg
