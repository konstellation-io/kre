FROM ubuntu:18.04

# Fix error installing pipenv:
#   RuntimeError: Click will abort further execution because
#   Python 3 was configured to use ASCII as encoding for the environment.
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

RUN apt update
RUN apt -y install python3.7 python3-pip python3.7-dev

WORKDIR /kre

COPY src src
COPY Pipfile .
COPY Pipfile.lock .

RUN pip3 install pipenv
RUN pipenv install --system --deploy

CMD [ "bash","-c","python3","/kre/src/main.py" ]
