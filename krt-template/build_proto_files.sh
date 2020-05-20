#!/bin/bash

export VERSION_DIR=$1

mkdir -p ./$VERSION_DIR/src/entrypoint
python -m grpc_tools.protoc -I./$VERSION_DIR --python_out=./$VERSION_DIR/src/entrypoint --python_grpc_out=./$VERSION_DIR/src/entrypoint ./$VERSION_DIR/public_input.proto
