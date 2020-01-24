#!/bin/sh

export NAMESPACE=$1
export VERSION=$2

kubectl -n $NAMESPACE delete deployment $(kubectl -n $NAMESPACE get deployment -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers) --grace-period=0 --force
kubectl -n $NAMESPACE delete pod $(kubectl -n $NAMESPACE get pod -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers) --grace-period=0 --force
kubectl -n $NAMESPACE delete configmap $(kubectl -n $NAMESPACE get configmap -l version-name=$VERSION -o custom-columns=":metadata.name" --no-headers) --grace-period=0 --force
