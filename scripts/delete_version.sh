#!/bin/sh

export NAMESPACE=$1
export VERSION=$2

show_header() {
  printf "\n\n##    %-30s\n" "$@"
}

show_header "Deleting $VERSION on $NAMESPACE"

DEPLOYMENT_NAMES=$(kubectl -n $NAMESPACE get deployment -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers)
POD_NAMES=$(kubectl -n $NAMESPACE get pod -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers)
CONFIG_NAMES=$(kubectl -n $NAMESPACE get configmap -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers)


[ -n "$DEPLOYMENT_NAMES" ] && show_header "Deleting deployments" && kubectl -n $NAMESPACE delete deployment $DEPLOYMENT_NAMES --grace-period=0 --force
[ -n "$POD_NAMES" ] &&  show_header "Deleting pods" &&kubectl -n $NAMESPACE delete pod $POD_NAMES --grace-period=0 --force
[ -n "$CONFIG_NAMES" ] && show_header "Deleting configs" && kubectl -n $NAMESPACE delete configmap $CONFIG_NAMES --grace-period=0 --force

echo "Done"
