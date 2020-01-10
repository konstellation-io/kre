FROM ubuntu:18.04

# Fix error installing pipenv:
#   RuntimeError: Click will abort further execution because
#   Python 3 was configured to use ASCII as encoding for the environment.
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

RUN apt update && \
    apt -y install python3.7 python3-pip python3.7-dev && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.7 1 && \
    update-alternatives --set python3 /usr/bin/python3.7

WORKDIR /kre

COPY . .

RUN python3 -m pip install pipenv && \
    pipenv install --system --deploy

CMD [ "/usr/bin/python3","/kre/src/main.py" ]
