FROM ubuntu:18.04

# Fix error installing pipenv:
#   RuntimeError: Click will abort further execution because
#   Python 3 was configured to use ASCII as encoding for the environment.
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

RUN apt update
RUN apt -y install python3.7 python3-pip python3.7-dev

WORKDIR /kre

COPY . .

RUN python3.7 -m pip install pipenv && \
    pipenv sync && \
    pipenv run pip freeze > requirements.txt && \
    python3.7 -m pip install -r requirements.txt

CMD [ "/usr/bin/python3.7","/kre/src/main.py" ]
