FROM ubuntu:18.04


RUN apt update
RUN apt -y install python3.7 python3-pip python3.7-dev 

WORKDIR /kre
COPY . .
RUN python3.7 -m pip install -r requirements.txt

CMD [ "/usr/bin/python3.7","/kre/kre-runner.py" ]
