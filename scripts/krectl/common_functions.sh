#!/bin/sh

# Supress warning for echo functions
# shellcheck disable=SC2028 # https://github.com/koalaman/shellcheck/wiki/SC2028
# shellcheck disable=SC2034 # https://github.com/koalaman/shellcheck/wiki/SC2034

replace_env_vars() {
  echo_wait "replacing env vars"
  ./scripts/replace_env_path.sh > /dev/null 2>&1
}

run() {
  set -e
  # shellcheck disable=SC2048
  if [ "$VERBOSE" = "1" ]; then
    echo_run "$*"
    $*
  else
    $* > /dev/null 2>&1
  fi
}

check_requirements() {
  REQUIREMENTS_OK=1

  OPERATOR_SDK_INSTALLED=$(cmd_installed operator-sdk)
  HOSTCTL_INSTALLED=$(cmd_installed hostctl)

  MINIKUBE_INSTALLED=$(cmd_installed minikube)
  [ "$MINIKUBE_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing Minikube installation"; }

  ENVSUBT_INSTALLED=$(cmd_installed envsubst)
  [ "$ENVSUBT_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing gettext installation"; }

  DOCKER_INSTALLED=$(cmd_installed docker)
  [ "$DOCKER_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing docker command"; }

  KUBECTL_INSTALLED=$(cmd_installed kubectl)
  [ "$KUBECTL_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing kubectl command"; }

  HELM_INSTALLED=$(cmd_installed helm)
  [ "$HELM_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing helm command"; }

  if [ "$REQUIREMENTS_OK" = "0" ]; then
    exit 1
  fi
}

cmd_installed() {
  if command -v "$1" >/dev/null 2>&1; then
    echo 1
  else
    echo 0
  fi
}

check_not_empty() {
  VARNAME=$1
  ERR=${2:-"Missing variable $VARNAME"}
  # shellcheck disable=SC1083
  eval VALUE=\${"$VARNAME"}

  # If value is empty exit execution
  [ "$VALUE" != "" ] || { echo_fatal "$ERR" && exit 1; }

  return 0
}


## Print lines helpers (NO DIRECT COLORING, call echo_<color> instead)
echo_run() {
  echo_info "  🏃 $*"
}

echo_warning() {
  echo "⚠️️  $(echo_yellow "$*") ⚠️️"
}

echo_fatal() {
  echo "⚠️️  $(echo_red "$*")"
  exit 1
}

echo_wait() {
  echo "⏳ $*"
}

echo_info() {
  echo_yellow "$*"
}

echo_check() {
  echo_light_green "✔ $*"
}

echo_done() {
  MSG=${1:-"Done"}
  echo
  echo_green "✔ ${MSG}."
  echo
}

echo_debug() {
  if [ "$DEBUG" = "1" ]; then
      echo "$* $*\n" "$(echo_red "[DEBUG]")" "$@"
  fi
}

# Coloring echo strings (NO NEW LINES HERE, use helpers instead)

echo_red() {
  echo "\033[31m$*\033[m\n"
}

echo_green() {
  echo "\033[92m$*\033[m"
}

echo_light_green() {
  echo "\033[32m$*\033[m"
}

echo_yellow() {
  echo "\033[33m$*\033[m"
}

echo_red() {
  echo "\033[31m$*\033[m"
}
