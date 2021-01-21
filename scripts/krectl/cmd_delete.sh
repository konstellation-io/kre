#!/bin/sh

cmd_delete() {
    TYPE=$1
    shift

    if [ "$TYPE" = "version" ]; then
      delete_version "$@"
    fi
}

show_delete_help() {
  echo "$(help_global_header "delete version <names>")

    sub-commands:
      version <namespace> <version-name>  removes one version from <runtime-id>.

    $(help_global_options)
"
}

# shellcheck disable=SC2086
delete_version() {
  NAME=$1
  VERSION=$2
  NS="${NAME}"

  mongo_script() {
    echo "db.getCollection('versions').remove({ \"name\": \"$1\" })"
  }
  echo_info "Deleting '$VERSION' on $NS"

  DEPLOYMENT_NAMES=$(kubectl -n "$NS" get deployment -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$DEPLOYMENT_NAMES" ] && \
    echo_info "Deleting version deployments" && \
    ( run kubectl -n "$NS" delete deployment $DEPLOYMENT_NAMES --grace-period=0 --force || true )

  POD_NAMES=$(kubectl -n "$NS" get pod  -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$POD_NAMES" ] && \
    echo_info "Deleting version pods" && \
    ( run kubectl -n "$NS" delete pod $POD_NAMES --grace-period=0 --force || true )

  CONFIG_NAMES=$(kubectl -n "$NS" get configmap  -l version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$CONFIG_NAMES" ] && \
    echo_info "Deleting versions configs" && \
    (run kubectl -n "$NS" delete configmap $CONFIG_NAMES --grace-period=0 --force || true )

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
