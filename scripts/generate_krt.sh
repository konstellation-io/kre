#!/bin/sh

export VERSION=$1
export KRT_FILE="$VERSION.krt"
export VERSION_DIR="krt-$VERSION"

rm -rf $VERSION_DIR
rm -rf $KRT_FILE
cp krt-template $VERSION_DIR -r

cd $VERSION_DIR

../scripts/replace_env_path.sh

rm krt.yml.tpl

cd ..

tar -zcvf $KRT_FILE $VERSION_DIR
