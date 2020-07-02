import os
from grpclib.server import Stream

from kre_grpc import EntrypointKRE

from public_input_grpc import EntrypointBase
from public_input_pb2 import Request, Response


class Entrypoint(EntrypointBase, EntrypointKRE):
    def __init__(self, logger, nc, subjects):
        logger.info(f"Entrypoint for '{os.environ['KRT_VERSION']}' initialized. ")
        EntrypointKRE.__init__(self, logger, nc, subjects)

    async def Greet(self, stream: Stream[Request, Response]) -> None:
        return await self.process_message(stream, "Greet")

    async def Salute(self, stream: Stream[Request, Response]) -> None:
        return await self.process_message(stream, "Salute")

    def make_response_object(self, subject, kre_nats_msg):
        if subject == 'Greet':
            self.logger.info(f"call to Greet(Request)"
                             f" responses with 'Response'. Data: {kre_nats_msg.data}")

            if kre_nats_msg.error:
                return Response(error=kre_nats_msg.error)
            else:
                return Response(**kre_nats_msg.data)

        if subject == 'Salute':
            self.logger.info(f"call to Salute(Request)"
                             f" responses with 'Response'. Data: {kre_nats_msg.data}")

            if kre_nats_msg.error:
                return Response(error=kre_nats_msg.error)
            else:
                return Response(**kre_nats_msg.data)

        raise Exception(f"unable to create a response from unknown subject '{subject}' ")
