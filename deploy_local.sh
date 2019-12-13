#!/bin/sh

. ./config.sh
. ./minikube_start.sh

set -e

if [ "$DEBUG" = "1" ]; then
  set -x
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

echo "Create Namespace if not exist...\n"
kubectl create ns kre --dry-run -o yaml | kubectl apply -f -

echo "Init helm tiller...\n"
helm init --upgrade --wait

helm dep update helm/kre
helm upgrade \
  --wait --recreate-pods \
  --install ${DEPLOY_NAME} --namespace ${NAMESPACE} \
  helm/kre

./scripts/show_minikube_etc_hosts.sh $MINIKUBE_PROFILE

echo "Done."
