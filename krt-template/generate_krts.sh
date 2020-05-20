#!/bin/bash

set -e

export VERSION_DIR=greeter
export VERSION=`cat $VERSION_DIR/krt.yml | yq r - version`

./build_krt.sh greeter

echo "Compiling go-greeter source code..."

cd go-greeter/src/greeter
go build -o ../../bin/greeter .
cd ../../../

./build_krt.sh go-greeter

echo "All KRTs generated"
