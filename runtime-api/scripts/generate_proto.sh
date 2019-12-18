#!/bin/sh

protoc runtimepb/runtime.proto --go_out=plugins=grpc:.
