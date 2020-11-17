#!/bin/bash

# shellcheck disable=SC2086

## USAGE:
#    ./build_krt.sh <new-version-name>

set -eu

VERSION_DIR="greeter"

# NOTE: if yq commands fails it due to the awesome Snap installation that is confined (heavily restricted).
# Please install yq binary from https://github.com/mikefarah/yq/releases and think twice before using Snap next time.

echo -e "Reading current version: \c"
CURRENT_VERSION=$(yq r ${VERSION_DIR}/krt.yml version)

echo "${CURRENT_VERSION}"

VERSION=${VERSION_DIR}-${1:-${CURRENT_VERSION#$VERSION_DIR-}}

if [ -z "$VERSION" ]; then
  echo "error setting KRT version"
  exit 1;
fi

echo "Building Golang binary..."
cd greeter/src/go-greeter
go build -o ../../bin/go-greeter .
cd ../../..

echo "Generating $VERSION.krt..."

mkdir -p build/${VERSION_DIR}
rm ./build/${VERSION_DIR}/{docs,src,assets,models,*.proto,*.yml} -rf

cd build/${VERSION_DIR}

cp  -r ../../${VERSION_DIR}/* .

yq write --inplace -- ./krt.yml 'version' "${VERSION}"

tar -zcf ../${VERSION}.krt  --exclude=*.krt --exclude=*.tar.gz *
cd ../../
rm  build/${VERSION_DIR} -rf

echo "Done"
