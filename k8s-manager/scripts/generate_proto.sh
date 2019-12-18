#!/bin/sh

protoc --go_out=plugins=grpc:. k8smanagerpb/*.proto
