FROM python:3.7.5

RUN pip install protobuf grpclib asyncio-nats-client

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["sh","-c","/entrypoint.sh"]
