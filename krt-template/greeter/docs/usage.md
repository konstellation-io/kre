# Usage

## Via gRPC

You can use the grpcurl to test the created version inside the KRE:

```
cat "{\"name\":\"John\"}" | grpcurl -plaintext -d @ "$ENTRYPOINT_URL" entrypoint.Entrypoint/Greet
```

Back to the [README](./README.md)
