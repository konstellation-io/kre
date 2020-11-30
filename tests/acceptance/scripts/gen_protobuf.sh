#!/bin/bash

PROTO_FOLDER=test_krt/runtime-test-v1

protoc -I=$PROTO_FOLDER \
  --go_out=pb --go_opt=paths=source_relative \
  --go-grpc_out=pb --go-grpc_opt=paths=source_relative \
  $PROTO_FOLDER/public_input.proto

echo "Done"
