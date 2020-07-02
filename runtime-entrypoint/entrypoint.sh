#!/bin/sh

set -eu

PROTO_FILE="/krt-files/public_input.proto"
ENTRYPOINT_FILE="/app/src/entrypoint/entrypoint.py"
CONTROL_FILE="/app/src/entrypoint/.generated"

if [ ! -f "$CONTROL_FILE" ];then
  # GENERATE entrypoint.py
  /app/entrypoint-gen -input /krt-files/public_input.proto -output $ENTRYPOINT_FILE

  # GENERATE protoc code
  python3 -m grpc_tools.protoc \
    --proto_path="$(dirname "$PROTO_FILE")" \
    --python_out=./src/entrypoint \
    --python_grpc_out=./src/entrypoint $PROTO_FILE

  touch $CONTROL_FILE

else
  echo "Entrypoint file ${ENTRYPOINT_FILE} already exists."
fi

python3 /app/src/main.py 2>&1 | tee -a /var/log/app/app.log
