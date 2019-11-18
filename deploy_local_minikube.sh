#!/bin/bash

set -ex

export NAMESPACE=kre
export DEPLOY_NAME=kre-local

# Init minikube with required addons
minikube start
minikube addons enable ingress 
minikube addons enable storage-provisioner
# Enable local registry to download images from local

eval $(minikube docker-env -u)   
if [[ "$SKIP_BUILD" -ne "1" ]]; then
    docker build -t konstellation/kre-admin-api:latest admin-api
fi

helm dep update helm/kre
helm init --upgrade --wait
helm upgrade \
  --wait --recreate-pods \
  --install ${DEPLOY_NAME} --namespace ${NAMESPACE} \
  --values helm/values-dev-local.yml helm/kre

echo "Done."
