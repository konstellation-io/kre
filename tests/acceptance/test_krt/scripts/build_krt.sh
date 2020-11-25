#!/bin/bash

set -eu

VERSION="runtime-test-v1"

mkdir -p build/${VERSION}
rm ./build/${VERSION}/{src,*.proto,*.yml} -rf

echo "Building Golang binary..."
cd ${VERSION}/src/go-runner
go build -o ../../bin/go-runner .
cd ../../..

echo "Generating $VERSION.krt..."
cd build/${VERSION}
cp  -r ../../${VERSION}/* .
tar -zcf ../${VERSION}.krt  --exclude=*.krt --exclude=*.tar.gz *
cd ../../
rm  build/${VERSION} -rf

echo "Done"
