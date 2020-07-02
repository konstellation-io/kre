#!/bin/bash

# shellcheck disable=SC2086

## USAGE:
#    ./build_krt.sh <krt-name> <new-version-name>

set -eu

VERSION_DIR="$1"

# NOTE: if yq commands fails it due to the awesome Snap installation that is confined (heavily restricted).
# Please install yq binary from https://github.com/mikefarah/yq/releases and think twice before using Snap next time.

echo -e "reading current version: \c"
CURRENT_VERSION=$(yq r ${VERSION_DIR}/krt.yml version)

echo "${CURRENT_VERSION}"

VERSION=${VERSION_DIR}-${2:-${CURRENT_VERSION#$VERSION_DIR-}}

if [ -z "$VERSION" ]; then
  echo "error setting KRT version"
  exit 1;
fi

echo "Generating $VERSION.krt..."

mkdir -p build/${VERSION_DIR}
rm ./build/${VERSION_DIR}/{src,assets,models,*.proto,*.yml} -rf

cp ${VERSION_DIR}/krt.yml build/${VERSION_DIR}
yq write --inplace -- ./build/${VERSION_DIR}/krt.yml 'version' "${VERSION}"

cd build/${VERSION_DIR}

cp  -r ../../${VERSION_DIR}/* .

tar -zcf ../${VERSION}.krt  --exclude=*.krt --exclude=*.tar.gz *
cd ../../
rm  build/${VERSION_DIR} -rf

echo "Done"
