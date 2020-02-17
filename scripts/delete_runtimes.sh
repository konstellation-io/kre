#!/bin/sh

## Usage:
##   delete_runtime.sh RUNTIME1 RUNTIME2 ... RUNTIME_N (without kre- prefix)

RUNTIMES=$*

MONGO_POD=$(kubectl -n kre get pod -l app=mongodb -o custom-columns=":metadata.name" --no-headers)
MONGO_DB=localKRE
MONGO_USER="admin"
MONGO_PASS=123456

show_header() {
  printf "\n\n##    %-30s\n" "$@"
}

mongo_script() {
  echo "db.getCollection('runtimes').remove({ \"name\": \"$1\" })"
}

for NAME in $RUNTIMES; do
  RUNTIME="kre-${NAME}"
  RUNTIME_EXISTS=$(kubectl get ns -o custom-columns=":metadata.name" --no-headers | grep "^${RUNTIME}$")

  if [ -n "$RUNTIME_EXISTS" ]; then
    show_header "Deleting runtime '$RUNTIME' "
    kubectl delete runtime $RUNTIME -n $RUNTIME --force --grace-period 0
    kubectl delete ns $RUNTIME --force --grace-period 0
    mongo_script $NAME | kubectl exec -n kre -it $MONGO_POD -- mongo --quiet -u $MONGO_USER -p $MONGO_PASS $MONGO_DB
  else
    show_header "runtime '$RUNTIME' doesn't exists. skipping. "
  fi
done

echo "Done"
