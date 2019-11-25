#!/bin/sh

set -e

if [ "$DEBUG" = "1" ]; then
  set -x
fi

export NAMESPACE=kre
export DEPLOY_NAME=kre-local
export MINIKUBE_PROFILE=${1:-minikube}

MINIKUBE_RUNNING=$(minikube status -p $MINIKUBE_PROFILE | grep apiserver | cut -d ' ' -f 2)


if [ "$MINIKUBE_RUNNING" = "Running" ]; then
  echo "Minikube already running"
else
  minikube start -p $MINIKUBE_PROFILE --cpus=4 --memory=4096 --kubernetes-version=1.15.4 --extra-config=apiserver.authorization-mode=RBAC
  minikube addons enable ingress
  minikube addons enable dashboard
  minikube addons enable registry
  minikube addons enable storage-provisioner
fi

# Setup environment to build images inside minikube
eval `minikube docker-env -p $MINIKUBE_PROFILE`


if [ "$SKIP_BUILD" != "1" ]; then
    docker build -t konstellation/kre-admin-api:latest admin-api
    docker build -t konstellation/kre-admin-ui:latest admin-ui
    docker build -t konstellation/kre-k8s-manager:latest k8s-manager
fi

export ADMIN_API_IMAGE_TAG="latest"
export ADMIN_UI_IMAGE_TAG="latest"
export K8S_MANAGER_IMAGE_TAG="latest"

./scripts/replace_env_path.sh

helm init --upgrade --wait
helm dep update helm/kre
helm upgrade \
  --wait --recreate-pods \
  --install ${DEPLOY_NAME} --namespace ${NAMESPACE} \
  helm/kre

echo "Done."
