#!/bin/sh

echo "Generating GraphQL and mocks..."
go generate ./...

echo "Generating dataloaders..."
./scripts/generate_dataloaders.sh

echo "Done"
