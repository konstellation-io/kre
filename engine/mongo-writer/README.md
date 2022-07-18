# mongo-writer

This application reads messages from NATS and stores data into MongoDB.

It is subscribed to two NATS subjects:
- **"mongo_writer"**: Incoming messages will be persisted into MongoDB.
- **"mongo_writer_logs"**: Incoming messages will processed as log entries.

### "mongo_writer" message

The received messages in "mongo_writer" subject are JSONs with two fields:
- **coll**: String with the collection name.
- **doc**: Object to persist.

Example:
```json
{
  "coll": "users",
  "doc": {"name":  "John"}
}
```

### "mongo_writer_logs" message

For every set of records flushed to a NATS Server, Fluent Bit uses the following JSON format:
```
[
  [UNIX_TIMESTAMP, JSON_MAP_1],
  [UNIX_TIMESTAMP, JSON_MAP_2],
  [UNIX_TIMESTAMP, JSON_MAP_N],
]
```

Example:

```
[
  [
    1588674979.594228,
    {
      "tag": "mongo_writer_logs",
      "doc": {
        "log": "INFO:kre-runner:connecting to NATS at 'kre-nats:4222'",
        "versionName": "greeter-v1",
        "nodeName": "greeter",
        "nodeId": "zyiwccceec",
        "workflowId": "qtkexzvppo"
      },
      "coll": "logs"
    }
  ],
  [
    1588674979.594235,
    {
      "tag": "mongo_writer_logs",
      "doc": {
        "log": "INFO:kre-runner:the handler script was loaded from '/krt-files/src/greeter/main.py'",
        "versionName": "greeter-v1",
        "nodeName": "greeter",
        "nodeId": "zyiwccceec",
        "workflowId": "qtkexzvppo"
      },
      "coll": "logs"
    }
  ]
]
```

## Development

### Connect with the deployed local environment

- Execute `./krectl.sh dev` and `./krectl.sh login --new`
- Get the user/password for the MongoDB.
- Create a port-forward for the runtime MongoDB instance.
- Create a port-forward for the runtime NATS instance.
- Configure the environment vars:
```
KRE_NATS_URL=localhost:4222
KRE_RUNTIME_MONGO_URI=mongodb://admin:123456@0.0.0.0:27017/admin?connect=direct
```
Notice the `?connect=direct` param in the MongoDB uri!

- Run/Debug the application
- Upload a new version, you can use the `/krt-template/build/greeter-v1.krt`
- Start the version (this will generate logs)
- Also you can publish the version and open a port-forward for the entrypoint.
Then you can execute the workflow using gcurl:
```
grpcurl -plaintext -d '{"name": "John"}' localhost:9001 entrypoint.Entrypoint/Greet
```
## Testing

To create new tests install [GoMock](https://github.com/golang/mock). Mocks used on tests are generated with
**mockgen**, when you need a new mock, add the following:

```go
//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}
```

To generate the mocks execute:
```sh
go generate ./...
```

### Run tests

```sh
go test ./...
```

## Linters

`golangci-lint` is a fast Go linters runner. It runs linters in parallel, uses caching, supports yaml config, has
integrations with all major IDE and has dozens of linters included.

As you can see in the `.golangci.yml` config file of this repo, we enable more linters than the default and
have more strict settings.

To run `golangci-lint` execute:
```sh
golangci-lint run
```
