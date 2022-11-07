#!/bin/sh

CLEAN_DOCKER=0
SETUP_ENV=0

cmd_build() {
  # NOTE: Use this loop to capture multiple unsorted args
  while test $# -gt 0; do
    case "$1" in
     --clean)
      CLEAN_DOCKER=1
      shift
    ;;
    --engine)
      BUILD_ENGINE=1
      BUILD_ALL=0
      shift
    ;;
    --runners)
      BUILD_RUNNERS=1
      BUILD_ALL=0
      shift
    ;;
    --skip-frontend)
      SKIP_FRONTEND_BUILD=1
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
      --engine         build only engine components (admin-api, k8s-manager, nats-manager, admin-ui, admin-ui-builder, mongo-writer).
      --runners        build only runners (kre-entrypoint, kre-py, kre-go, krt-files-downloader).
      --skip-frontend  skip docker build for admin-ui component.

    $(help_global_options)
"
}

build_docker_images() {
  # Engine
  if [ "$BUILD_ENGINE" = "1" ] || [ "$BUILD_ALL" = "1" ]; then
    build_engine
  fi

  setup_env

  # Runners
  if [ "$BUILD_RUNNERS" = "1" ] || [ "$BUILD_ALL" = "1" ]; then
    build_runners
  fi

  if [ "$SKIP_FRONTEND_BUILD" = "1" ]; then
    echo_warning "¡¡¡¡¡ started with option $(echo_yellow "--local-frontend or --skip-frontend")."
    echo "  Now run \`$(echo_light_green "yarn start")\` inside admin-ui"
  fi
}

setup_env() {
  if [ "$SETUP_ENV" = 1 ]; then
    return
  fi

  # Setup environment to build images inside minikube
  eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"
  SETUP_ENV=1
}

build_engine() {
  setup_env
  build_image kre-admin-api engine/admin-api
  build_image kre-k8s-manager engine/k8s-manager
  build_image kre-nats-manager engine/nats-manager

  if [ "$SKIP_FRONTEND_BUILD" != "1" ]; then
    build_image kre-admin-ui engine/admin-ui
  fi

  build_image kre-mongo-writer engine/mongo-writer
}

build_runners() {
  build_image kre-entrypoint runners/kre-entrypoint
  build_exitpoint_image kre-exitpoint runners/kre-exitpoint
  build_image kre-py runners/kre-py
  build_image kre-go runners/kre-go
  build_image krt-files-downloader runners/krt-files-downloader
}

build_image() {
  NAME=$1
  FOLDER=$2
  echo_build_header "$NAME"

  run docker build -t konstellation/"${NAME}":latest "$FOLDER"
}

build_exitpoint_image() {
  NAME=$1
  FOLDER=$2
  echo_build_header "$NAME"

  run docker build -f $FOLDER/Dockerfile.local -t konstellation/"${NAME}":latest "$FOLDER"
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
