#!/bin/sh

cmd_delete() {
    TYPE=$1
    shift
    if [ "$TYPE" = "runtime" ]; then
      delete_runtimes $*
    fi

    if [ "$TYPE" = "version" ]; then
      delete_version $*
    fi
}

## Usage:
##   krectl.sh delete_runtimes RUNTIME1 RUNTIME2 ... RUNTIME_N (without kre- prefix)

delete_runtime_script() {
    echo "db.getCollection('runtimes').remove({ \"name\": \"$1\" })"
}

delete_runtimes() {
  RUNTIMES=$@

  echo_wait "Deleting runtimes $RUNTIMES..."

  for NAME in $RUNTIMES; do
    RUNTIME="kre-${NAME}"
    RUNTIME_EXISTS=$(kubectl get ns -o custom-columns=":metadata.name" --no-headers | grep "^${RUNTIME}$")

    if [ "$RUNTIME_EXISTS" != "" ]; then
      echo_info "Deleting runtime '$RUNTIME' "
      run kubectl delete runtime $RUNTIME -n $RUNTIME --force --grace-period 0
      run kubectl delete ns $RUNTIME --force --grace-period 0
    else
      echo_yellow "  runtime '$RUNTIME' doesn't exists. skipping.\n"
    fi
    delete_runtime_script $NAME | run execute_mongo_script
  done
}


## Usage:
##   local_env.sh delete_version NAMESPACE VERSION

delete_version() {
  NAME=$1
  VERSION=$2
  NAMESPACE="kre-${NAME}"

  mongo_script() {
    echo "db.getCollection('versions').remove({ \"name\": \"$1\" })"
  }
  echo_info "Deleting $VERSION on $NAMESPACE"

  DEPLOYMENT_NAMES=$(kubectl -n $NAMESPACE get deployment -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers)
  POD_NAMES=$(kubectl -n $NAMESPACE get pod -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers)
  CONFIG_NAMES=$(kubectl -n $NAMESPACE get configmap -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers)

  [ -n "$DEPLOYMENT_NAMES" ] && echo_yellow "Deleting deployments" && kubectl -n $NAMESPACE delete deployment $DEPLOYMENT_NAMES --grace-period=0 --force
  [ -n "$POD_NAMES" ] && echo_yellow "Deleting pods" && kubectl -n $NAMESPACE delete pod $POD_NAMES --grace-period=0 --force
  [ -n "$CONFIG_NAMES" ] && echo_yellow "Deleting configs" && kubectl -n $NAMESPACE delete configmap $CONFIG_NAMES --grace-period=0 --force
  mongo_script $VERSION | execute_mongo_script
}

execute_mongo_script() {
  if [ "$MONGO_POD" = "" ]; then
    MONGO_POD=$(kubectl -n kre get pod -l app=mongodb -o custom-columns=":metadata.name" --no-headers)
  fi

  check_not_empty "MONGO_POD" "error finding MongoDB pod on $NAMESPACE\n"

  kubectl exec -n kre -it $MONGO_POD -- mongo --quiet -u $MONGO_USER -p $MONGO_PASS $MONGO_DB $*
}
