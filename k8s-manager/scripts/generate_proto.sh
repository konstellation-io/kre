#!/bin/sh

protoc --go_out=plugins=grpc:. k8smanagerpb/*.proto

if [ -d "../admin-api" ]; then
    cp k8smanagerpb/k8smanager.pb.go ../admin-api/k8smanagerpb/
fi
