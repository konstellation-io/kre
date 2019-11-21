#!/bin/bash

set -ex

export NAMESPACE=kre
export DEPLOY_NAME=kre-local

# Init minikube with required addons
minikube start --kubernetes-version=1.15.2
minikube addons enable ingress 
minikube addons enable storage-provisioner

# Enable local registry to download images from local
eval $(minikube docker-env -u)   
if [[ "$SKIP_BUILD" -ne "1" ]]; then
    docker build -t konstellation/kre-admin-api:latest admin-api
    docker build -t konstellation/kre-admin-ui:latest admin-ui
fi

export ADMIN_API_IMAGE_TAG="latest"
export ADMIN_UI_IMAGE_TAG="latest"
export K8S_MANAGER_IMAGE_TAG="latest"

./scripts/replace_env_path.sh

helm dep update helm/kre
helm init --upgrade --wait
helm upgrade \
  --wait --recreate-pods \
  --install ${DEPLOY_NAME} --namespace ${NAMESPACE} \
  helm/kre

echo "Done."
