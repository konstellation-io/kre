#!/bin/sh

cmd_dev() {
  case $* in

  # WARNING: Doing a hard reset before deploying
  *--hard* | *--dracarys*)
    minikube_hard_reset
    ;;

  # Use it when you want to develop on admin-ui outside k8s and using the mock server
  *--frontend-mock*)
    KRE_ADMIN_API_BASE_URL="http://localhost:4000"
    KRE_ADMIN_FRONTEND_BASE_URL="http://dev-admin.kre.local:3000"
    SKIP_FRONTEND_BUILD=1
    shift
  ;;

  # Use it when you want to develop on admin-ui outside k8s
  *--local-frontend*)
    KRE_ADMIN_FRONTEND_BASE_URL="http://dev-admin.kre.local:3000"
    SKIP_FRONTEND_BUILD=1
    shift
  ;;
  esac

  minikube_start
  CLEAN_DOCKER=1
  build_docker_images
  cmd_deploy
}
