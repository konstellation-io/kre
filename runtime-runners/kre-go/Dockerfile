FROM ubuntu:20.04

RUN mkdir -p /var/log/app
COPY entrypoint.sh entrypoint.sh

CMD ["sh","-c","./entrypoint.sh 2>&1 | tee -a /var/log/app/app.log"]
