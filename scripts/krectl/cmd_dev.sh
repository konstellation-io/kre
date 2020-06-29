#!/bin/sh

# disable unused vars check, vars are used on functions inside subscripts
# shellcheck disable=SC2034 # https://github.com/koalaman/shellcheck/wiki/SC2034

cmd_dev() {
  # NOTE: Use this loop to capture multiple unsorted args
  while test $# -gt 0; do
    case "$1" in
      # WARNING: Doing a hard reset before deploying
      --hard|--dracarys)
        MINIKUBE_RESET=1
        shift
      ;;

      # Use it when you want to develop on admin-ui outside k8s and using the mock server
      --frontend-mock)
        KRE_ADMIN_API_BASE_URL="http://dev-admin.kre.local:4000"
        KRE_ADMIN_FRONTEND_BASE_URL="http://dev-admin.kre.local:3000"
        SKIP_FRONTEND_BUILD=1
        shift
      ;;

      # Use it when you want to develop on admin-ui outside k8s
      --local-frontend)
        KRE_ADMIN_FRONTEND_BASE_URL="http://dev-admin.kre.local:3000"
        SKIP_FRONTEND_BUILD=1
        shift
      ;;

      *)
        shift
      ;;
    esac
  done

  if [ "$MINIKUBE_RESET" = "1" ]; then
    minikube_hard_reset
  fi

  minikube_start
  minikube_clean
  cmd_build "$@"
  deploy

  # Automatic login after hard reset
  if [ "$MINIKUBE_RESET" = "1" ]; then
    cmd_login "--new"
  fi
}

show_dev_help() {
  echo "$(help_global_header "dev")

    options:
      --hard, --dracarys  remove all contents of minikube kre profile. $(echo_yellow "(WARNING: will re-build all docker images again)").
      --frontend-mock     starts a local mock server to avoid calling the actual API during Frontend development.
      --local-frontend    starts a local server outside from kubernetes for faster development.

    $(help_global_options)
"
}
