#!/bin/sh

protoc runtimepb/runtime.proto --go_out=plugins=grpc:.

cp runtimepb/runtime.pb.go ../admin-api/runtimepb/
