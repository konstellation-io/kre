#!/bin/sh

set -e
if [ "$DEBUG" = "1" ]; then
  set -x
fi

. ./config.sh
. ./scripts/functions.sh

export ADMIN_API_IMAGE_TAG="latest"
export ADMIN_UI_IMAGE_TAG="latest"
export K8S_MANAGER_IMAGE_TAG="latest"
export KRE_ADMIN_FRONTEND_BASE_URL="http://admin-kre.local"

check_requirements

case $* in
# WARNING: Doing a hard reset before deploying
*--hard* | *--dracarys*)
  . ./scripts/minikube_hard_reset.sh
  ;;
  # Use it when you want to develop on admin-ui outside k8s
*--local-frontend*)
  KRE_ADMIN_FRONTEND_BASE_URL="http://localhost:3000"
  export SKIP_FRONTEND_BUILD=1
  ;;
*--skip-build*)
  export SKIP_BUILD=1
  ;;
esac

./scripts/replace_env_path.sh
. ./scripts/minikube_start.sh

# Setup environment to build images inside minikube
eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"

if [ "$SKIP_BUILD" != "1" ]; then
  if [ "$SKIP_FRONTEND_BUILD" != "1" ]; then
    build_header "kre-admin-ui"
    docker build -t konstellation/kre-admin-ui:latest admin-ui
  fi

  build_header "kre-admin-api"
  docker build -t konstellation/kre-admin-api:latest admin-api
  build_header "kre-k8s-manager"
  docker build -t konstellation/kre-k8s-manager:latest k8s-manager
  build_header "kre-runtime-api"
  docker build -t konstellation/kre-runtime-api:latest runtime-api
  build_header "kre-runtime-entrypoint"
  docker build -t konstellation/kre-runtime-entrypoint runtime-entrypoint
  build_header "kre-mongo-writer"
  docker build -t konstellation/kre-mongo-writer mongo-writer
  build_header "runner kre-py"
  docker build -t konstellation/kre-py:latest runtime-runners/kre-py
fi

HELM_VERSION=3 # Change to 2 if you haven't upgraded yet.

if [ "$HELM_VERSION" = "2" ]; then
  # Helm v2 needs to be initiated first
  echo "Init helm tiller...\n"
  helm init --upgrade --wait
else
  # Helm v3 needs this the base repo to be added manually
  helm repo add stable https://kubernetes-charts.storage.googleapis.com
fi

export SDK_RELEASE_VERSION="v0.13.0"
export OPERATOR_SDK_INSTALLED=$(cmd_installed operator-sdk)

if [ "$SKIP_BUILD" != "1" ] && [ "$OPERATOR_SDK_INSTALLED" = "1" ]; then
  build_header "kre-operator"
  helm dep update operator/helm-charts/kre-chart
  cd operator && operator-sdk build konstellation/kre-operator:latest && cd ..
fi

echo "📚️ Create Namespace if not exist...\n"
kubectl create ns kre --dry-run -o yaml | kubectl apply -f -

echo "📦 Applying helm chart...\n"
helm dep update helm/kre
helm upgrade \
  --wait \
  --install "${DEPLOY_NAME}" \
  --namespace "${NAMESPACE}" \
  helm/kre

./scripts/show_minikube_etc_hosts.sh "${MINIKUBE_PROFILE}"

if [ "$OPERATOR_SDK_INSTALLED" != "1" ]; then
  echo "\n\n\n"
  echo_warning "¡¡¡¡¡ Operator SDK not installed. Operator image was not built!!!\n\n\n"
fi

if [ "$SKIP_FRONTEND_BUILD" = "1" ]; then
  echo "\n\n\n"
  echo_warning "¡¡¡¡¡ started with local-frontend option. Now run \`yarn start\` inside /admin-ui!!!\n\n\n"
fi

echo_green "\n✔️  Done.\n\n"
