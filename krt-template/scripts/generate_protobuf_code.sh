#!/bin/bash

protoc -I=greeter --go_out=greeter/src/go-greeter --python_out=greeter/src/py-greeter greeter/public_input.proto

echo "Done"
