#!/bin/bash

if [ -f "$KRT_HANDLER_PATH" ]; then
  ./$KRT_HANDLER_PATH
else
  echo "Error: KRT_HANDLER_PATH='$KRT_HANDLER_PATH' not exist"
fi
