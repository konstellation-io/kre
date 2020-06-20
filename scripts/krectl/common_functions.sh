#!/bin/sh

replace_env_vars() {
  echo_wait "replacing env vars"
  ./scripts/replace_env_path.sh  2>&1 > /dev/null
}


run() {
  if [ "$VERBOSE" = "1" ]; then
    echo_info "🏃 $*\n"
    $*

  else
    $* 2>&1 > /dev/null
  fi
}

check_requirements() {
  REQUIREMENTS_OK=1

  export OPERATOR_SDK_INSTALLED=$(cmd_installed operator-sdk)

  MINIKUBE_INSTALLED=$(cmd_installed minikube)
  [ "$MINIKUBE_INSTALLED" = "1" ] || (export REQUIREMENTS_OK=0 && echo_warning "Missing Minikube installation")

  ENVSUBT_INSTALLED=$(cmd_installed envsubst)
  [ "$ENVSUBT_INSTALLED" = "1" ] || (export REQUIREMENTS_OK=0 && echo_warning "Missing gettext installation")

  DOCKER_INSTALLED=$(cmd_installed docker)
  [ "$DOCKER_INSTALLED" = "1" ] || (export REQUIREMENTS_OK=0 && echo_warning "Missing docker command")

  KUBECTL_INSTALLED=$(cmd_installed helm)
  [ "$KUBECTL_INSTALLED" = "1" ] || (export REQUIREMENTS_OK=0 && echo_warning "Missing kubectl command")

  HELM_INSTALLED=$(cmd_installed helm)
  [ "$HELM_INSTALLED" = "1" ] || (export REQUIREMENTS_OK=0 && echo_warning "Missing helm command")

  if [ "$REQUIREMENTS_OK" = "0" ]; then
    exit 1
  fi
}

cmd_installed() {
  if command -v $1 >/dev/null 2>&1; then
    echo 1
  else
    echo 0
  fi
}

check_not_empty() {
  VARNAME=$1
  ERR=${2:-"Missing variable $VARNAME"}
  eval VALUE=\${$VARNAME}

  # If value is empty exit execution
  [ "$VALUE" != "" ] || { echo_fatal "$ERR" && exit 1; }

  return 0
}

echo_build_header() {
  if [ "$VERBOSE" = "1" ]; then
    printf "\n\n#########################################\n"
    printf "##  🏭  %-36s   ##\n" `echo_yellow "$@"`
    printf "#########################################\n\n"
  else
    echo_yellow "🏭 $@\n"
  fi
}

echo_warning() {
  printf "\033[31m⚠️️  $@\033[m"
}

echo_fatal() {
  echo_warning "$@\n"
  exit 1
}

echo_green() {
  printf "\033[92m$@\033[m"
}

echo_yellow() {
  printf "\033[33m$@\033[m"
}

echo_red() {
  printf "\033[31m$@\033[m"
}

echo_wait() {
  printf "⏳ $@\n"
}

echo_info() {
  printf " $@\n"
}

echo_done() {
  echo_green "\n✔️  Done.\n\n"
}

echo_debug() {
  if [ "$DEBUG" = "1" ]; then
      printf "%s %s\n" `echo_red "[DEBUG]"` "$@"
  fi
}
