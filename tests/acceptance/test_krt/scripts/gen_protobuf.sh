#!/bin/bash

protoc -I=runtime-test-v1 \
  --go_out=runtime-test-v1/src/go-runner/pb \
  --python_out=runtime-test-v1/src/py-runner \
  runtime-test-v1/public_input.proto

echo "Done"
