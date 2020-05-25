# KRE Python Runner

This is an implementation in Python for the KRE runner.

## Usage

The injected code must implement a `handler(ctx, data)` function and optionally a `init(ctx)` function.

The context object received by theses functions, has the following methods:

```python
ctx.get_path("relative/path.xxx")
ctx.set_value("label", value)
ctx.get_value("label")
await ctx.save_metric("predicted_value", "true_value", "date", "error")
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

# this function will be executed once when the runner is starting
def init(ctx):
  # load file and save in memory to be used within the handler
  ctx.set_value("categories", pickle.load(ctx.get_path("data/categories.pkl")))

# this function will be executed when a message is received
async def handler(ctx, data):
  # data is the received message from the queue
  categories = ctx.get_value("categories")

  # Saves metrics in MongoDB DB sending a message to the MongoWriter queue
  await ctx.save_metric(date="2020-04-06T09:02:09.277853Z",predicted_value="class_x",true_value="class_y")
  await ctx.save_metric(error=ctx.ERR_MISSING_VALUES, date="2020-04-07T00:00:00.0Z")
  await ctx.save_metric(error=ctx.ERR_NEW_LABELS) # If the date is not set, the 'date' field value will be now

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

You must provide the env vars.
Inside the `test` folder should be a `env_vars.sh` file.
If this file doesn't exist, execute the following command in the **root folder** (`/kre`):

```shell script
./scripts/replace_env_path.sh
```

To start the runner execute:

```shell script
pipenv shell
source test/env_vars.sh
python3 src/main.py
```

3. Send a message using the `test/test_runner.py`:

```shell script
pipenv shell
python3 test/test_runner.py
```
