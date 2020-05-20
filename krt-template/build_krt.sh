#!/bin/bash

set -e

export VERSION_DIR=$1
export VERSION=`yq r $VERSION_DIR/krt.yml version`

echo "1. Generate proto files..."
./build_proto_files.sh $VERSION_DIR

echo "2. Generating $VERSION.krt..."
mkdir -p build
cd $VERSION_DIR
tar -zcf ../build/$VERSION.krt krt.yml src bin public_input.proto

echo "Done"
