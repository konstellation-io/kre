#!/bin/bash

ORIGINAL_APP="$KRT_BASE_PATH/$KRT_HANDLER_PATH"

if [ -f "$ORIGINAL_APP" ]; then
  # Copy the original executable to a new one because
  # using Minio (S3) the linux execute permission doesn't exist
  cp $ORIGINAL_APP app
  chmod +x app
  ./app
else
  echo "Error: \$KRT_BASE_PATH/\$KRT_HANDLER_PATH='$ORIGINAL_APP' not exist"
fi
