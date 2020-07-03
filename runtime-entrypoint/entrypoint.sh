#!/bin/sh

set -eu

PROTO_FILE="/krt-files/public_input.proto"
ENTRYPOINT_FILE="/app/src/entrypoint/entrypoint.py"

# GENERATE entrypoint.py
echo "generating '${ENTRYPOINT_FILE}' file."
/app/entrypoint-gen -input $PROTO_FILE -output $ENTRYPOINT_FILE

# GENERATE protoc code
echo "generating entrypoint protofub files."
python3 -m grpc_tools.protoc \
  --proto_path="$(dirname "$PROTO_FILE")" \
  --python_out=./src/entrypoint \
  --python_grpc_out=./src/entrypoint $PROTO_FILE

python3 /app/src/main.py 2>&1 | tee -a /var/log/app/app.log
