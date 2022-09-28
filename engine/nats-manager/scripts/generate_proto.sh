#!/bin/sh

for PROTO_FILE in proto/**/*.proto; do
  protoc -I=./proto/natspb/ \
  --go_out=proto/natspb --go_opt=paths=source_relative \
  --go-grpc_out=proto/natspb --go-grpc_opt=paths=source_relative \
  $PROTO_FILE
done

if [ -d "../admin-api" ]; then
  for PB_FILE in $(find proto -iname "*.pb.go"); do
    DST=$(basename "$(dirname "$PB_FILE")")
    mkdir -p ../admin-api/adapter/service/proto/${DST}
    cp "$PB_FILE" "../admin-api/adapter/service/proto/${DST}/"
  done
fi
