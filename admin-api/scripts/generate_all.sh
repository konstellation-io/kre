#!/bin/sh

./scripts/generate_mocks.sh
./scripts/generate_graphql.sh
./scripts/generate_dataloaders.sh

echo "Done"
