import asyncio
import logging
import abc

from nats.aio.client import Client as NATS


class Runner:
    def __init__(self, runner_name, config):
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s %(levelname)s %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%S%z"
        )
        logging.addLevelName(logging.DEBUG, 'DEBUG')
        logging.addLevelName(logging.WARNING, 'WARN')
        logging.addLevelName(logging.FATAL, 'ERROR')
        logging.addLevelName(logging.CRITICAL, 'ERROR')

        self.logger = logging.getLogger(runner_name)
        self.loop = asyncio.get_event_loop()
        self.nc = NATS()
        self.config = config
        self.subscription_sid = None
        self.runner_name = runner_name

    def start(self):
        try:
            asyncio.ensure_future(self.connect())
            asyncio.ensure_future(self.process_messages())
            self.loop.run_forever()
        except KeyboardInterrupt:
            self.logger.info("process interrupted")
        finally:
            self.loop.run_until_complete(self.stop())
            self.logger.info("closing loop")
            self.loop.close()

    async def connect(self):
        self.logger.info(f"Connecting to NATS {self.config.nats_server}...")
        await self.nc.connect(self.config.nats_server, loop=self.loop, name=self.runner_name)

    async def stop(self):
        if self.subscription_sid is not None:
            self.logger.info(f"unsubscribe from sid '{self.subscription_sid}'")
            await self.nc.unsubscribe(self.subscription_sid)

        if not self.nc.is_closed:
            self.logger.info("closing NATS connection")
            await self.nc.close()

        self.logger.info("stop loop")
        self.loop.stop()

    @abc.abstractmethod
    async def process_messages(self):
        raise Exception(f"process_messages should be implemented.")
