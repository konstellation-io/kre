#!/bin/sh

CLEAN_DOCKER=0

cmd_build() {
  # NOTE: Use this loop to capture multiple unsorted args
  while test $# -gt 0; do
    case "$1" in
     --clean)
      CLEAN_DOCKER=1
      shift
    ;;
    --skip-frontend)
      SKIP_FRONTEND_BUILD=1
      shift
    ;;
    --skip-operator)
      SKIP_OPERATOR_BUILD=1
      shift
    ;;

     *)
      shift
      ;;
    esac
  done

  if [ "$CLEAN_DOCKER" = "1" ]; then
    minikube_clean
  fi
  build_docker_images
}

show_build_help() {
  echo "$(help_global_header "build")

    options:
      --clean          sends a prune command to remove old docker images and containers. (will keep last 24h).
      --skip-frontend  skip docker build for admin-ui component.

    $(help_global_options)
"
}

build_docker_images() {
  # Setup environment to build images inside minikube
  echo_wait "Setting minikube docker-env\n"
  eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"

  # Runners
  build_image kre-runtime-entrypoint runners/kre-entrypoint
  build_image kre-py runners/kre-py
  build_image kre-go runners/kre-go

  # Admin
  build_image kre-admin-api admin-api
  build_image kre-k8s-manager k8s-manager

  if [ "$SKIP_FRONTEND_BUILD" != "1" ]; then
    build_image kre-admin-ui admin-ui
  fi

  # Runtime
  build_image kre-runtime-api runtime/runtime-api
  build_image kre-mongo-writer runtime/mongo-writer

  if  [ "$SKIP_OPERATOR_BUILD" != "1" ]; then
    if [ "$OPERATOR_SDK_INSTALLED" = "1" ]; then
      # Init helm and basic dependencies
      prepare_helm

      echo_build_header "k8s-runtime-operator"
      {
        cd runtime/k8s-runtime-operator || return
        run helm dep update helm-charts/kre-chart \
          && run operator-sdk build konstellation/kre-k8s-runtime-operator:latest
        cd ..
      }
    else
      echo
      echo_warning "¡¡¡¡¡ Operator SDK not installed. Operator image was not built!!!"
      echo
    fi
  fi

  if [ "$SKIP_FRONTEND_BUILD" = "1" ]; then
    echo_warning "¡¡¡¡¡ started with option $(echo_white "--local-frontend or --skip-frontend")."
    echo "  Now run \`$(echo_light_green "yarn start")\` inside admin-ui"
  fi
}

build_image() {
  NAME=$1
  FOLDER=$2
  echo_build_header "$NAME"

  run docker build -t konstellation/"${NAME}":latest "$FOLDER"
}

echo_build_header() {
  if [ "$VERBOSE" = "1" ]; then
    BORDER="$(echo_light_green "##")"
    echo
    echo_light_green "#########################################"
    printf "%s 🏭  %-37s   %s\n" "$BORDER" "$(echo_yellow "$*")" "$BORDER"
    echo_light_green "#########################################"
    echo
  else
    echo_info "  🏭 $*"
  fi
}
