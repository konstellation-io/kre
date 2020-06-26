#!/bin/sh

cmd_deploy() {
  prepare_helm
  case $* in
  *--build*)
    build_docker_images $*
    ;;
  esac

  deploy
}

deploy() {
  replace_env_vars
  deploy_helm_chart
  show_etc_hosts
}

prepare_helm() {
  if [ "$HELM_VERSION" = "2" ]; then
    # Helm v2 needs to be initiated first
    run echo_wait "Init helm v2...\n"
    run helm init --upgrade --wait
  else
    # Helm v3 needs this the base repo to be added manually
    run echo_wait "Init helm v3..."
    run helm repo add stable https://kubernetes-charts.storage.googleapis.com
  fi
}

deploy_helm_chart() {
  echo_yellow "📚️ Create Namespace if not exist...\n"
  kubectl create ns "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

  echo_yellow "📦 Applying helm chart...\n"
  run helm dep update helm/kre
  run helm upgrade \
    --wait \
    --install "${DEPLOY_NAME}" \
    --namespace "${NAMESPACE}" \
    --set developmentMode=${DEVELOPMENT_MODE} \
    helm/kre
}

show_etc_hosts() {
  MINIKUBE_IP=$(minikube ip -p $MINIKUBE_PROFILE)

  if [ -z "$MINIKUBE_IP" ]; then
    echo_warning "If you are using a different profile run the script with the profile name."
    return
  fi
  echo_yellow "\n👇 Add the following lines to your /etc/hosts\n"
  echo "$MINIKUBE_IP api.kre.local"
  echo "$MINIKUBE_IP admin.kre.local"
  echo "127.0.0.1 dev-admin.kre.local # If you are using local frontend"
  echo
}
