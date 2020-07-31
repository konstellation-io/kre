#!/bin/sh

for PROTO_FILE in proto/**/*.proto; do
  protoc --go_out=plugins=grpc:. "$PROTO_FILE"
done

DEST_DIR="../../admin/admin-api"

if [ -d $DEST_DIR ]; then
  echo "Copying proto files to admin-api"
  for PB_FILE in $(find proto -iname "*.pb.go"); do
    DST=$(basename "$(dirname "$PB_FILE")")
    cp "$PB_FILE" "${DEST_DIR}/adapter/service/proto/${DST}/"
  done
fi
