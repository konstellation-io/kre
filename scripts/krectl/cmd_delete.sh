#!/bin/sh

cmd_delete() {
    TYPE=$1
    shift

    if [ "$TYPE" = "version" ]; then
      delete_version "$@"
    fi

    if [ "$TYPE" = "runtime" ]; then
          delete_runtime "$@"
        fi
}

show_delete_help() {
  echo "$(help_global_header "delete (version|runtime) <names>")

    sub-commands:
      version <namespace> <runtime-id> <version-name>  removes one version from <runtime-id>.
      runtime <namespace> <runtime-id>  removes runtime <runtime-id>.

    $(help_global_options)
"
}

# shellcheck disable=SC2086
delete_version() {
  NAME=$1
  RUNTIME=$2
  VERSION=$3
  NS="${NAME}"

  mongo_script() {
    echo "use $1;"
    echo "db.versions.remove({ \"name\": \"$2\" });"
  }
  echo_info "Deleting version '$VERSION' from runtime '$RUNTIME' on $NS"

  DEPLOYMENT_NAMES=$(kubectl -n "$NS" get deployment -l runtime-id="$RUNTIME",version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$DEPLOYMENT_NAMES" ] && \
    echo_info "Deleting version deployments" && \
    ( run kubectl -n "$NS" delete deployment $DEPLOYMENT_NAMES --grace-period=0 --force || true )

  POD_NAMES=$(kubectl -n "$NS" get pod  -l runtime-id="$RUNTIME",version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$POD_NAMES" ] && \
    echo_info "Deleting version pods" && \
    ( run kubectl -n "$NS" delete pod $POD_NAMES --grace-period=0 --force || true )

  CONFIG_NAMES=$(kubectl -n "$NS" get configmap  -l runtime-id="$RUNTIME",version-name="$VERSION" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$CONFIG_NAMES" ] && \
    echo_info "Deleting versions configs" && \
    (run kubectl -n "$NS" delete configmap $CONFIG_NAMES --grace-period=0 --force || true )

  mongo_script "$RUNTIME" "$VERSION" | execute_mongo_script
}

# shellcheck disable=SC2086
delete_runtime() {
  NAME=$1
  RUNTIME=$2
  NS="${NAME}"

  mongo_script() {
    echo "db.getCollection('runtimes').remove({ \"_id\": \"$1\" });"
    echo "use $RUNTIME;"
    echo "db.dropDatabase();"
    echo "use $RUNTIME-data;"
    echo "db.dropDatabase();"
  }
  echo_info "Deleting runtime '$RUNTIME' on $NS"

  DEPLOYMENT_NAMES=$(kubectl -n "$NS" get deployment -l runtime-id="$RUNTIME" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$DEPLOYMENT_NAMES" ] && \
    echo_info "Deleting runtime deployments" && \
    ( run kubectl -n "$NS" delete deployment $DEPLOYMENT_NAMES --grace-period=0 --force || true )

  POD_NAMES=$(kubectl -n "$NS" get pod  -l runtime-id="$RUNTIME" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$POD_NAMES" ] && \
    echo_info "Deleting runtime pods" && \
    ( run kubectl -n "$NS" delete pod $POD_NAMES --grace-period=0 --force || true )

  CONFIG_NAMES=$(kubectl -n "$NS" get configmap  -l runtime-id="$RUNTIME" -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')
  [ -n "$CONFIG_NAMES" ] && \
    echo_info "Deleting runtime configs" && \
    (run kubectl -n "$NS" delete configmap $CONFIG_NAMES --grace-period=0 --force || true )

  mongo_script "$RUNTIME" | execute_mongo_script

  delete_influx_database "$RUNTIME"
}

delete_influx_database() {
  RUNTIME=$1
  INFLUX_POD=$(get_influx_pod)
  COMMAND="DROP DATABASE $RUNTIME"

  kubectl exec -n kre -it "$INFLUX_POD" -- influx -execute "DROP DATABASE $RUNTIME"
}

# shellcheck disable=SC2120
execute_mongo_script() {
#  DATABASE=$1
  if [ "$MONGO_POD" = "" ]; then
    MONGO_POD=$(get_mongo_pod)
  fi

  check_not_empty "MONGO_POD" "error finding MongoDB pod on '$NAMESPACE'\n"

  run kubectl exec -n kre -it "$MONGO_POD" -- mongo --quiet -u "$MONGO_USER" -p "$MONGO_PASS" "$MONGO_DB" --authenticationDatabase admin "$@"
}
