#!/bin/sh

for PROTO_FILE in proto/**/*.proto; do
  protoc --go_out=plugins=grpc:. "$PROTO_FILE"
done

if [ -d "../admin-api" ]; then
  for PB_FILE in $(find proto -iname "*.pb.go"); do
    DST=$(basename "$(dirname "$PB_FILE")")
    cp "$PB_FILE" "../admin-api/adapter/service/proto/${DST}/"
  done
fi
