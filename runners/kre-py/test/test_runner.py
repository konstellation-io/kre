import asyncio
import json

from nats.aio.client import Client as NATS
from nats.aio.errors import ErrTimeout


async def run(loop):
    print("Connecting to NATS...")
    nc = NATS()
    await nc.connect("localhost:4222", loop=loop)

    input_subject = "test-subject-input"
    try:
        payload = {
            "data": {"name": "John Doe"},
        }

        async def message_handler(msg):
            subject = msg.subject
            reply = msg.reply
            data = msg.data.decode()
            print(f"[WRITER] Received a message on '{subject} {reply}': {data}")
            try:
                await nc.publish(reply, bytes("{\"success\": true }", encoding='utf-8'))
                print(f"[WRITER] reply ok")
            except Exception as err:
                print(f"[WRITER] exception: {err}")

        sid = await nc.subscribe("mongo_writer", cb=message_handler)
        print("Waiting for a metrics message...")

        # Stop receiving after 3 calls to save_metrics() and 1 call to save_data().
        await nc.auto_unsubscribe(sid, 4)

        print(f"Sending a test message to {input_subject}...")
        msg = await nc.request(input_subject, bytes(json.dumps(payload), encoding='utf-8'), timeout=120)
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
