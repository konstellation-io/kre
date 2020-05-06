#!/bin/bash

set -e

export VERSION_DIR=greeter
export VERSION=`yq r $VERSION_DIR/krt.yml version`

echo "1. Generate proto files..."
./generate_proto_files.sh $VERSION_DIR

echo "2. Generating $VERSION.krt..."
mkdir -p build
cd $VERSION_DIR
tar -zcf ../build/$VERSION.krt krt.yml src public_input.proto

echo "Done"
