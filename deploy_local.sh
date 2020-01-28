#!/bin/sh

. ./config.sh

case $* in
  # WARNING: Doing a hard reset before deploying
   *--hard*)
     . ./minikube_hard_reset.sh
esac

. ./minikube_start.sh

set -e

if [ "$DEBUG" = "1" ]; then
  set -x
fi

cmd_installed() {
    if command -v $1 >/dev/null 2>&1; then
        echo 1
    else
        echo 0
    fi
}

echo_warning() {
  echo "\033[31m$1\033[m"
}

show_header() {
  echo "\n\n#########################################"
  printf "##    %-30s   ##\n" "$@"
  echo "#########################################\n\n"
}

# Setup environment to build images inside minikube
eval `minikube docker-env -p $MINIKUBE_PROFILE`

export ADMIN_API_IMAGE_TAG="latest"
export ADMIN_UI_IMAGE_TAG="latest"
export K8S_MANAGER_IMAGE_TAG="latest"
export SDK_RELEASE_VERSION="v0.13.0"
export OPERATOR_SDK_INSTALLED=$(cmd_installed operator-sdk)

./scripts/replace_env_path.sh

echo "Init helm tiller...\n"
helm init --upgrade --wait

if [ "$SKIP_BUILD" != "1" ]; then
    show_header "kre-admin-api"
    docker build -t konstellation/kre-admin-api:latest admin-api
    show_header "kre-admin-ui"
    docker build -t konstellation/kre-admin-ui:latest admin-ui
    show_header "kre-k8s-manager"
    docker build -t konstellation/kre-k8s-manager:latest k8s-manager
    show_header "kre-runtime-api"
    docker build -t konstellation/kre-runtime-api:latest runtime-api
    show_header "kre-runtime-entrypoint"
    docker build -t konstellation/kre-runtime-entrypoint runtime-entrypoint
    show_header "kre-mongo-writer"
    docker build -t konstellation/kre-mongo-writer mongo-writer
    show_header "runtime runner kre-py"
    docker build -t konstellation/kre-py:latest runtime-runners/kre-py

    if [ "$OPERATOR_SDK_INSTALLED" = "1" ]; then
      show_header "kre-operator"
      helm dep update operator/helm-charts/kre-chart
      cd operator && operator-sdk build konstellation/kre-operator:latest && cd ..
    fi
fi

echo "Create Namespace if not exist...\n"
kubectl create ns kre --dry-run -o yaml | kubectl apply -f -



helm dep update helm/kre
helm upgrade \
  --wait --recreate-pods \
  --install "${DEPLOY_NAME}" --namespace "${NAMESPACE}" \
  helm/kre

./scripts/show_minikube_etc_hosts.sh "${MINIKUBE_PROFILE}"

if [ "$OPERATOR_SDK_INSTALLED" != "1" ]; then
      echo_warning "\n\n\n¡¡¡¡¡WARNING: Operator SDK not installed. Operator image was not built!!!\n\n\n"
fi

echo "Done."
