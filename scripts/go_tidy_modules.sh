#!/bin/bash

# execute from root of project

cd engine/admin-api
go mod tidy

cd ../k8s-manager
go mod tidy

cd ../mongo-writer
go mod tidy

cd ../../libs/krt-utils/
go mod tidy

cd ../simplelogger/
go mod tidy
