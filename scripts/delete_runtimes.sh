#!/bin/sh

## Usage:
##   delete_runtime.sh RUNTIME1 RUNTIME2 ... RUNTIME_N

RUNTIMES=$*

show_header() {
  printf "\n\n##    %-30s\n" "$@"
}

for RUNTIME in $RUNTIMES; do
  RUNTIME_EXISTS=$(kubectl  get ns -o custom-columns=":metadata.name" --no-headers | grep "^${RUNTIME}$")

  if [ -n "$RUNTIME_EXISTS" ]; then
    show_header "Deleting runtime '$RUNTIME' "
    kubectl delete runtime $RUNTIME -n $RUNTIME --force --grace-period 0
    kubectl delete ns $RUNTIME --force --grace-period 0
  else
    show_header "runtime '$RUNTIME' doesn't exists. skipping. "
  fi
done

echo "Done"
