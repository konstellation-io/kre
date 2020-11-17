# Usage

## Via gRPC

You can use the grpcurl to test the created version inside the KRE:

```
echo '{"name":"John"}' | grpcurl -plaintext -d @ "$ENTRYPOINT_URL" entrypoint.Entrypoint/PyGreet

echo '{"name":"John"}' | grpcurl -plaintext -d @ "$ENTRYPOINT_URL" entrypoint.Entrypoint/GoGreet
```

Back to the [README](./README.md)
