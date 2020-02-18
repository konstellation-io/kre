#!/bin/sh

NAMESPACE=$1
VERSION=$2
MONGO_DB=localKRE
MONGO_USER="admin"
MONGO_PASS=123456

show_header() {
  printf "\n\n##    %-30s\n" "$@"
}

mongo_script() {
  echo "db.getCollection('versions').remove({ \"name\": \"$1\" })"
}
show_header "Deleting $VERSION on $NAMESPACE"

MONGO_POD=$(kubectl -n kre get pod -l app=mongodb -o custom-columns=":metadata.name" --no-headers)

DEPLOYMENT_NAMES=$(kubectl -n $NAMESPACE get deployment -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers)
POD_NAMES=$(kubectl -n $NAMESPACE get pod -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers)
CONFIG_NAMES=$(kubectl -n $NAMESPACE get configmap -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers)

[ -n "$DEPLOYMENT_NAMES" ] && show_header "Deleting deployments" && kubectl -n $NAMESPACE delete deployment $DEPLOYMENT_NAMES --grace-period=0 --force
[ -n "$POD_NAMES" ] && show_header "Deleting pods" && kubectl -n $NAMESPACE delete pod $POD_NAMES --grace-period=0 --force
[ -n "$CONFIG_NAMES" ] && show_header "Deleting configs" && kubectl -n $NAMESPACE delete configmap $CONFIG_NAMES --grace-period=0 --force
mongo_script $VERSION | kubectl exec -n kre -it $MONGO_POD -- mongo -u $MONGO_USER -p $MONGO_PASS $MONGO_DB --quiet
echo "Done"
