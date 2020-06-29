#!/bin/sh

cmd_delete() {
    TYPE=$1
    shift

    if [ "$TYPE" = "runtime" ]; then
      delete_runtimes "$@"
    fi

    if [ "$TYPE" = "version" ]; then
      delete_version "$@"
    fi
}

show_delete_help() {
  echo "$(help_global_header "delete <runtime|version> <names>")

    sub-commands:
      version <runtime-name> <version-name>  removes one version from <runtime-name>.
      runtime <runtime-name> [<runtime-name2> ... <runtime-name-N>] completely removes runtimes.

    $(help_global_options)
"
}

delete_runtime_script() {
  echo "db.getCollection('runtimes').remove({ \"name\": \"$1\" })"
}

delete_runtimes() {
  RUNTIMES="$*"

  echo_wait "  deleting runtimes $(echo_green "${RUNTIMES}")..."

  for NAME in $RUNTIMES; do
    RUNTIME="kre-${NAME}"
    RUNTIME_EXISTS=$(kubectl get ns -o custom-columns=":metadata.name" --no-headers | grep "^${RUNTIME}$")

    if [ "$RUNTIME_EXISTS" != "" ]; then
      delete_runtime_script "$NAME" | execute_mongo_script
      echo_check "  removed runtime '$RUNTIME' from MongoDB."

      echo_wait "  deleting runtime '$RUNTIME' "
      run kubectl delete runtime "$RUNTIME" -n "$RUNTIME" --force --grace-period 0
      run kubectl delete ns "$RUNTIME" --force --grace-period 0
      echo_check "  runtime '$RUNTIME' removed."
    else
      echo_info "  runtime '$RUNTIME' doesn't exists. skipping."
    fi
  done
}


delete_version() {
  NAME=$1
  VERSION=$2
  NAMESPACE="kre-${NAME}"

  mongo_script() {
    echo "db.getCollection('versions').remove({ \"name\": \"$1\" })"
  }
  echo_info "Deleting '$VERSION' on $NAMESPACE"

  DEPLOYMENT_NAMES=$(kubectl -n "$NAMESPACE" get deployment -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers)
  POD_NAMES=$(kubectl -n "$NAMESPACE" get pod -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers)
  CONFIG_NAMES=$(kubectl -n "$NAMESPACE" get configmap -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers)

  [ -n "$DEPLOYMENT_NAMES" ] && echo_info "Deleting deployments" && kubectl -n "$NAMESPACE" delete deployment "$DEPLOYMENT_NAMES" --grace-period=0 --force
  [ -n "$POD_NAMES" ] && echo_info "Deleting pods" && kubectl -n "$NAMESPACE" delete pod "$POD_NAMES" --grace-period=0 --force
  [ -n "$CONFIG_NAMES" ] && echo_info "Deleting configs" && kubectl -n "$NAMESPACE" delete configmap "$CONFIG_NAMES" --grace-period=0 --force
  mongo_script "$VERSION" | execute_mongo_script "$@"
}

execute_mongo_script() {
  if [ "$MONGO_POD" = "" ]; then
    MONGO_POD=$(get_mongo_pod)
  fi

  check_not_empty "MONGO_POD" "error finding MongoDB pod on '$NAMESPACE'\n"

  run kubectl exec -n kre -it "$MONGO_POD" -- mongo --quiet -u "$MONGO_USER" -p "$MONGO_PASS" "$MONGO_DB" "$@"
}
