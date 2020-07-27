#!/bin/sh

echo "Generating code and mocks..."
go generate ./...
mockery -all

echo "Generating proto..."
./scripts/generate_proto.sh

echo "Done"
