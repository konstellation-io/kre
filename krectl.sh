#!/bin/sh

# disable unused vars check, vars are used on functions inside subscripts
# shellcheck disable=SC2034 # https://github.com/koalaman/shellcheck/wiki/SC2034

set -eu

DEBUG=${DEBUG:-0}

if [ "$DEBUG" = "1" ]; then
  set -x
fi

# Default values
VERBOSE=0
SKIP_FRONTEND_BUILD=0
SKIP_OPERATOR_BUILD=0
OPERATOR_SDK_INSTALLED=0
HOSTCTL_INSTALLED=0
MINIKUBE_RESET=0
MONGO_POD=""

# Admin MongoDB credentials
MONGO_DB=localKRE
MONGO_USER="admin"
MONGO_PASS=123456

# DEV Admin User
ADMIN_DEV_EMAIL="dev@local.local"

. ./.krectl.conf
. ./scripts/krectl/common_functions.sh
. ./scripts/krectl/cmd_help.sh
. ./scripts/krectl/cmd_minikube.sh
. ./scripts/krectl/cmd_etchost.sh
. ./scripts/krectl/cmd_dev.sh
. ./scripts/krectl/cmd_build.sh
. ./scripts/krectl/cmd_deploy.sh
. ./scripts/krectl/cmd_login.sh
. ./scripts/krectl/cmd_delete.sh
. ./scripts/krectl/cmd_restart.sh

check_requirements

echo

# Parse global arguments
case $* in
  *\ -v*)
    VERBOSE=1
  ;;
  *--help|-h*)
    show_help "$@"
    exit
  ;;
esac

if [ -z "$*" ] || { [ "$VERBOSE" = "1" ] && [ "$#" = "1" ]; }; then
  echo_warning "missing command"
  echo
  echo
  show_help
  exit 1
fi

# Split command and sub-command args and remove global flags
COMMAND=$1
shift
COMMAND_ARGS=$(echo "$*" | sed -e 's/ +-v//g')

# Check which command is requested
case $COMMAND in
  start)
    minikube_start
    echo_done "Start done"
    exit 0
  ;;

  etchost)
    cmd_etchost
    echo_done "Done"
    exit 0
  ;;

  stop)
    minikube_stop
    echo_done "Stop done"
    exit 0
  ;;

  dev)
    cmd_dev "$@"
    echo_done "Dev environment created"
    exit 0
  ;;

  deploy)
    cmd_deploy "$@"
    echo_done "Deploy done"
    exit 0
  ;;

  build)
    cmd_build "$@"
    echo_done "Build done"
    exit 0
  ;;

  delete)
    # NOTE: horrible hack to avoid passing -v as argument to sub-command
     # shellcheck disable=SC2046 # https://github.com/koalaman/shellcheck/wiki/SC2046
     # shellcheck disable=SC2116 # https://github.com/koalaman/shellcheck/wiki/SC2116
     cmd_delete $(echo "$COMMAND_ARGS")
    echo_done "Delete done"
    exit 0
  ;;

  restart)
    cmd_restart "$@"
    echo_done "Restart done"
    exit 0
  ;;

  login)
    cmd_login "$@"
    echo_done "Login done"
    exit 0
  ;;

  *)
    echo_warning "unknown command: $(echo_yellow "$COMMAND")"
    echo
    echo
    show_help
    exit 1

esac

