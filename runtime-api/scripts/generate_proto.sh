#!/bin/sh

protoc runtimepb/runtime.proto --go_out=plugins=grpc:.

if [ -d "../admin-api" ]; then
    cp runtimepb/runtime.pb.go ../admin-api/runtimepb/
fi
