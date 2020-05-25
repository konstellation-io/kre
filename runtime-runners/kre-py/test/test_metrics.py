import asyncio

from nats.aio.client import Client as NATS


async def run(loop):
    print("Connecting to NATS...")
    nc = NATS()
    await nc.connect("localhost:4222", loop=loop)

    async def message_handler(msg):
        subject = msg.subject
        reply = msg.reply
        data = msg.data.decode()
        print(f"Received a message on '{subject} {reply}': {data}")

        # Terminate connection to NATS.
        await nc.close()
        loop.stop()

    sid = await nc.subscribe("test-subject-mongo-writer", cb=message_handler)
    print("Waiting for a metrics message...")

    # Stop receiving after 1 messages.
    await nc.auto_unsubscribe(sid, 1)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    try:
        asyncio.ensure_future(run(loop))
        loop.run_forever()
    except KeyboardInterrupt:
        print("Process interrupted")
    finally:
        print("Closing Loop")
        loop.close()
