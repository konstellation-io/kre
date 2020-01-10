import asyncio
import json

from nats.aio.client import Client as NATS
from nats.aio.errors import ErrTimeout


async def run(loop):
    print("Connecting to NATS...")
    nc = NATS()
    await nc.connect("localhost:4222", loop=loop)

    try:
        msg = await nc.request("example_channel_input",
                               bytes(json.dumps({'data': 'test msg'}), encoding="utf-8"), timeout=120)
        res = json.loads(msg.data.decode())
        print("error -> ", res['error'])
        print("data -> ", res['data'])
    except ErrTimeout:
        print("Request timed out")

    await nc.close()

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run(loop))
    loop.close()
