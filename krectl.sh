#!/bin/sh

set -u

DEBUG=${DEBUG:-0}

if [ "$DEBUG" = "1" ]; then
  set -x
fi

# Default values
VERBOSE=0
SKIP_FRONTEND_BUILD=0
OPERATOR_SDK_INSTALLED=0
MINIKUBE_RESET=0
CLEAN_DOCKER=0
MONGO_POD=""

# Admin MongoDB credentials
MONGO_DB=localKRE
MONGO_USER="admin"
MONGO_PASS=123456

# DEV Admin User
ADMIN_DEV_EMAIL="dev@local.local"

. ./.krectl.conf
. ./scripts/krectl/common_functions.sh
. ./scripts/krectl/cmd_minikube.sh
. ./scripts/krectl/cmd_dev.sh
. ./scripts/krectl/cmd_build.sh
. ./scripts/krectl/cmd_deploy.sh
. ./scripts/krectl/cmd_login.sh
. ./scripts/krectl/cmd_delete.sh

check_requirements

echo ""

# Parse global arguments
case $* in
  *\ -v*)
    VERBOSE=1
  ;;
esac

COMMAND=$1
shift

case $COMMAND in
  start)
    minikube_start
    echo_done
    exit 0
  ;;

  stop)
    minikube_stop
    echo_done
    exit 0
  ;;

  dev)
     cmd_dev $*
  ;;

  deploy)
    cmd_deploy $*
  ;;

  build)
    # Build all docker images
    cmd_build $*
  ;;

  delete)
    cmd_delete $*
    echo_done
    exit 0
  ;;

  login)
    cmd_login $*
    echo_done
    exit 0
  ;;

  *)
    echo_debug "unknown command $*"
    shift
esac

# Automatic login after hard reset
if [ "$MINIKUBE_RESET" = "1" ]; then
  cmd_login --new
else
  echo_done
fi
