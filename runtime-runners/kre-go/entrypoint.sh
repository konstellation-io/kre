#!/bin/bash

APP="$KRT_BASE_PATH/$KRT_HANDLER_PATH"

if [ -f "$APP" ]; then
  ./$APP
else
  echo "Error: \$KRT_BASE_PATH/\$KRT_HANDLER_PATH='$APP' not exist"
fi
