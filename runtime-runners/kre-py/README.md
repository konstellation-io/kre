# KRE Python Runner

This is an implementation in Python for the KRE runner.

## Usage

The injected code must implement a `handler(ctx, data)` function and optionally a `init(ctx)` data.


The context object received by theses functions, has the following methods:

```python
ctx.get_path("relative/path.xxx")
ctx.set_value("label", value)
ctx.get_value("label")
ctx.save_metric("label", value)
```

The runner will have the following environment variables:
```
KRT_VERSION
KRT_NODE_NAME
KRT_NATS_SERVER
KRT_NATS_INPUT
KRT_NATS_OUTPUT
KRT_NATS_MONGO_WRITER
KRT_BASE_PATH
KRT_HANDLER_PATH
```

This is an example of the code that will be run by the docker py3 runner:

```python
import pickle
import numpy as np
import pandas as pd

def init(ctx):
  # load file and save in memory to be used within the handler
  ctx.set_value("categories", pickle.load(ctx.get_path("data/categories.pkl")))

def handler(ctx, data):
  # data is the received message from the queue

  categories = ctx.get_value("categories")
  
  ctx.save_metric('elapsedtime', {'ms': 12345}) # Saves in MongoDB DB sending a message to the MongoWriter queue

  normalized_data = np.xxx(categories)
  normalized_data = pd.xxx(normalized_data)

  return normalized_data # returned value will be published in the output queue
```


## Development

First of all, install the dependencies using pipenv:

```shell script
pipenv install --dev
```

If you don't have pipenv installed (you must have python 3.7 installed in your system):

```shell script
pip3 install --user pipenv
```

You can test the code manually following these steps:

1. Start the NATS server:

```shell script
cd test
docker-compose up
```

2. Start the runner:
```shell script
pipenv shell
python3 src/main.py
```

You must provide the env vars, e.g.:
```shell script
export KRT_VERSION=testVersion1
export KRT_NODE_NAME=nodeA
export KRT_NATS_SERVER=localhost:4222
export KRT_NATS_INPUT=test-subject-input
export KRT_NATS_OUTPUT=test-subject-output
export KRT_NATS_MONGO_WRITER=test-subject-mongo-writer
export KRT_BASE_PATH=/home/user/projects/kre/runtime-runners/kre-py/test/myvol
export KRT_HANDLER_PATH=src/node/node_handler.py
```

3. Send a message using the `test/test_runner.py`:
```shell script
pipenv shell
python3 test/test_runner.py
```
