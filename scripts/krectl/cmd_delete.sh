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
      version <runtime-id> <version-name>  removes one version from <runtime-id>.
      runtime <runtime-id> [<runtime-id-2> ... <runtime-id-N>] completely removes runtimes.

    $(help_global_options)
"
}

delete_runtime_script() {
  echo "db.getCollection('runtimes').remove({ \"_id\": \"$1\" }); db.getCollection('versions').remove({ \"runtimeId\": \"$1\" });"
}

delete_runtimes() {
  RUNTIMES="$*"

  echo_wait "  deleting runtimes $(echo_green "${RUNTIMES}")..."

  for NAME in $RUNTIMES; do
    RUNTIME="${NAME}"

    # Skip -q on delete command
    if [ "$RUNTIME" = "kre--q" ]; then
      continue
    fi

    delete_runtime_script "$NAME" | execute_mongo_script
    echo_check "  removed runtime '$RUNTIME' from MongoDB."

    RUNTIME_EXISTS=$( kubectl get ns -o custom-columns=":metadata.name" --no-headers | grep "^${RUNTIME}$" || echo "")

    if [ "$RUNTIME_EXISTS" != "" ]; then
      run kubectl delete runtime "$RUNTIME" -n "$RUNTIME" --force --grace-period 0 || true

      DEPLOYMENT_NAMES=$(kubectl -n "$RUNTIME" get deployment -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
      [ -n "$DEPLOYMENT_NAMES" ] && \
        echo_info "Deleting versions deployments" && \
        ( run kubectl -n "$RUNTIME" delete deployment $DEPLOYMENT_NAMES --grace-period=0 --force || true )

      POD_NAMES=$(kubectl -n "$RUNTIME" get pod -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
      [ -n "$POD_NAMES" ] && \
        echo_info "Deleting versions pods" && \
        ( run kubectl -n "$RUNTIME" delete pod $POD_NAMES --grace-period=0 --force || true )

      CONFIG_NAMES=$(kubectl -n "$RUNTIME" get configmap -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
      [ -n "$CONFIG_NAMES" ] && \
        echo_info "Deleting versions configs" && \
        (run kubectl -n "$RUNTIME" delete configmap $CONFIG_NAMES --grace-period=0 --force || true )

      echo_wait "  deleting runtime '$RUNTIME' "
      run kubectl delete ns "$RUNTIME" --force --grace-period 0 || true
      echo_check "  runtime '$RUNTIME' removed."
    else
      echo_info "  runtime '$RUNTIME' doesn't exists. skipping."
    fi
  done
}


# shellcheck disable=SC2086
delete_version() {
  NAME=$1
  VERSION=$2
  RUNTIME="${NAME}"

  mongo_script() {
    echo "db.getCollection('versions').remove({ \"name\": \"$1\" })"
  }
  echo_info "Deleting '$VERSION' on $RUNTIME"

  DEPLOYMENT_NAMES=$(kubectl -n "$RUNTIME" get deployment -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$DEPLOYMENT_NAMES" ] && \
    echo_info "Deleting version deployments" && \
    ( run kubectl -n "$RUNTIME" delete deployment $DEPLOYMENT_NAMES --grace-period=0 --force || true )

  POD_NAMES=$(kubectl -n "$RUNTIME" get pod  -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$POD_NAMES" ] && \
    echo_info "Deleting version pods" && \
    ( run kubectl -n "$RUNTIME" delete pod $POD_NAMES --grace-period=0 --force || true )

  CONFIG_NAMES=$(kubectl -n "$RUNTIME" get configmap  -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$CONFIG_NAMES" ] && \
    echo_info "Deleting versions configs" && \
    (run kubectl -n "$RUNTIME" delete configmap $CONFIG_NAMES --grace-period=0 --force || true )

  mongo_script "$VERSION" | execute_mongo_script
}

# shellcheck disable=SC2120
execute_mongo_script() {
  if [ "$MONGO_POD" = "" ]; then
    MONGO_POD=$(get_mongo_pod)
  fi

  check_not_empty "MONGO_POD" "error finding MongoDB pod on '$NAMESPACE'\n"

  run kubectl exec -n kre -it "$MONGO_POD" -- mongo --quiet -u "$MONGO_USER" -p "$MONGO_PASS" "$MONGO_DB" "$@"
}
