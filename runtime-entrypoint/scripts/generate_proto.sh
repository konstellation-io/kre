#!/bin/sh

protoc proto/entrypoint.proto --go_out=plugins=grpc:.
