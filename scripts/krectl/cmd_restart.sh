#!/bin/sh

cmd_restart() {
    TYPE=${1:-"minikube"}

    if [ "$TYPE" = "kre" ]; then
      restart_admin_pods
    fi

    if [ "$TYPE" = "version" ]; then
      shift
      restart_version "$@"
    fi

    if [ "$TYPE" = "minikube" ]; then
      minikube_stop
      minikube_start
    fi

}

show_restart_help() {
  echo "$(help_global_header "restart <type> [options]")

    types:
      minikube  restarts minikube (default option).
      kre       restarts pods on kre namespace.
      version   <runtime-name> <version-name> restarts all pods inside a version.

    $(help_global_options)
"
}

restart_admin_pods() {
  POD_NAMES=$(kubectl -n "${NAMESPACE}" get pod -l type=admin -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')

  if [ -z "$POD_NAMES" ]; then
    echo_fatal "no pods to restart"
    return
  fi

  echo_wait "Restarting kre pods"
  # shellcheck disable=SC2086 # this behaviour is expected here
  run kubectl -n "${NAMESPACE}" delete pod ${POD_NAMES} --grace-period=0
}

get_version_pods() {
  NAMESPACE=$1
  VERSION=$2
  kubectl -n "$NAMESPACE" get pod -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers
}

restart_version() {
  NAME=$1
  VERSION=$2
  NAMESPACE="kre-${NAME}"

  POD_NAMES=$(get_version_pods "$NAMESPACE" "$VERSION" | tr '\n' ' ')

  if [ -z "$POD_NAMES" ]; then
    echo_fatal "no pods to restart"
    return
  fi

  echo_wait "Restarting '$VERSION' on $NAME"
  # shellcheck disable=SC2086 # this behaviour is expected here
  run kubectl -n "${NAMESPACE}" delete pod ${POD_NAMES} --grace-period=0
}
