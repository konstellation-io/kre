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
        "log": "INFO:kre-runner:connecting to NATS at 'kre-nats-client:4222'",
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
- Create a Runtime (use http://admin.kre.local)
- Get the user/password for the created runtime MongoDB. It is stored in the KRE MongoDB database.
- Create a port-forward for the runtime MongoDB instance.
- Create a port-forward for the runtime NATS instance.
- Configure the environment vars:
```
KRT_NATS_SERVER=localhost:4222
KRE_RUNTIME_MONGO_URI=mongodb://admin:S3uyJKZy@0.0.0.0:27017/admin?connect=direct
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
