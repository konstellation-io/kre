#!/bin/bash

set -ex

export NAMESPACE=kre
export DEPLOY_NAME=kre-local

if [[ "$SKIP_BUILD" -ne "1" ]]; then
    docker build -t localhost:32000/konstellation/kre-admin-api:latest admin-api
    docker push localhost:32000/konstellation/kre-admin-api:latest
fi

helm dep update helm/kre
helm init --upgrade --wait
helm upgrade \
  --wait --recreate-pods \
  --install ${DEPLOY_NAME} --namespace ${NAMESPACE} \
  --values helm/values-dev-local.yml helm/kre

echo "Done."
