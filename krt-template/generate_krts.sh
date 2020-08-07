#!/bin/bash

set -e

echo "Creating greeter KRT"
./build_krt.sh greeter

echo ""
echo "Compiling go-greeter source code"
echo ""

cd go-greeter/src/greeter
# export GOARCH=arm64
go build -o ../../bin/greeter .
cd ../../../

echo "Creating go-greeter KRT"
./build_krt.sh go-greeter

echo ""
echo "All KRTs generated"
