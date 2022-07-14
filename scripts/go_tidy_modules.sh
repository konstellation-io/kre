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

cd ../../tests/acceptance/
go mod tidy

cd ../acceptance/test_krt/runtime-test-v1/src/go-runner/
go mod tidy
