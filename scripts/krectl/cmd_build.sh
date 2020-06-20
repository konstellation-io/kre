#!/bin/sh

cmd_build() {
  case $* in
  *--clean*)
      CLEAN_DOCKER=1
    ;;
  *--skip-frontend*)
      SKIP_FRONTEND_BUILD=1
    ;;
  esac

  build_docker_images
}

build_docker_images() {
  # Setup environment to build images inside minikube
  echo_info "setting minikube docker-env"
  eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"

  build_image kre-admin-api admin-api
  build_image kre-k8s-manager k8s-manager
  build_image kre-runtime-api runtime-api
  build_image kre-runtime-entrypoint runtime-entrypoint
  build_image kre-mongo-writer mongo-writer
  build_image kre-py runtime-runners/kre-py
  build_image kre-go runtime-runners/kre-go
  if [ "$SKIP_FRONTEND_BUILD" != "1" ]; then
    build_image kre-admin-ui admin-ui
  fi

  if [ "$OPERATOR_SDK_INSTALLED" = "1" ]; then
    # Init helm and basic dependencies
    prepare_helm

    echo_build_header "kre-operator"
    cd operator
    run helm dep update helm-charts/kre-chart \
    && run operator-sdk build konstellation/kre-operator:latest
    cd ..
  else
    echo_warning "¡¡¡¡¡ Operator SDK not installed. Operator image was not built!!!\n\n\n"
  fi

  if [ "$SKIP_FRONTEND_BUILD" = "1" ]; then
    echo_warning "¡¡¡¡¡ started with local-frontend option. Now run \`yarn start\` inside /admin-ui!!!\n\n\n"
  fi

  if [ "$CLEAN_DOCKER" = "1" ]; then
    minikube_clean
  fi
}

build_image() {
  NAME=$1
  FOLDER=$2
  echo_build_header $NAME

  run docker build -t konstellation/${NAME}:latest $FOLDER
}
