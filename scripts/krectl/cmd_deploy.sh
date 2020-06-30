#!/bin/sh

BUILD_DOCKER_IMAGES=0
cmd_deploy() {
  case $* in
    --build)
      BUILD_DOCKER_IMAGES=1
    ;;
  esac

  deploy
}

show_deploy_help() {
  echo "$(help_global_header "deploy")

    options:
      --build  re-build all docker images before deploying on minikube.
      --clean  sends a prune command to remove old docker images and containers.

    $(help_global_options)
"
}

deploy() {
  minikube_start
  prepare_helm

  if [ "$BUILD_DOCKER_IMAGES" = "1" ]; then
    build_docker_images
  fi

  replace_env_vars
  create_namespace
  deploy_helm_chart
  show_etc_hosts
}

HELM_READY=""

prepare_helm() {
  if [ "$HELM_READY" = "1" ]; then
    return
  fi

  if [ "$HELM_VERSION" = "2" ]; then
    # Helm v2 needs to be initiated first
    echo_wait "Init helm v2..."
    run helm init --upgrade --wait
  else
    # Helm v3 needs this the base repo to be added manually
    echo_wait "Init helm v3..."
    run helm repo add stable https://kubernetes-charts.storage.googleapis.com
  fi
  HELM_READY=1
}

create_namespace() {
  echo_info "📚️ Create Namespace if not exist..."
  NS=$(kubectl create ns "${NAMESPACE}" --dry-run=client -o yaml)
  if [ "$VERBOSE" = "1" ]; then
    # NOTE: there is no way to call run() with pipe commands
    echo_run "kubectl create ns \"${NAMESPACE}\" --dry-run=client -o yaml | kubectl apply -f -"
    echo "$NS" | kubectl apply -f -
  else
    echo "$NS" | kubectl apply > /dev/null -f - 2>&1
  fi
}

deploy_helm_chart() {
  echo_info "📦 Applying helm chart..."
  run helm dep update helm/kre
  run helm upgrade \
    --wait \
    --install "${DEPLOY_NAME}" \
    --namespace "${NAMESPACE}" \
    --set developmentMode="${DEVELOPMENT_MODE}" \
    helm/kre
}

show_etc_hosts() {
  MINIKUBE_IP=$(minikube ip -p "$MINIKUBE_PROFILE")

  if [ -z "$MINIKUBE_IP" ]; then
    echo_warning "If you are using a different profile run the script with the profile name."
    return
  fi
  echo
  echo_info "👇 Add the following lines to your /etc/hosts"
  echo
  echo "$MINIKUBE_IP api.kre.local"
  echo "$MINIKUBE_IP admin.kre.local"
  echo "127.0.0.1 dev-admin.kre.local # If you are using local frontend"
  echo
}
