#!/bin/sh

## NOTE: script execution is called at the bottom

set -eu

RUNTIME=$1
VERSION=runtime-test-v1
ENTRYPOINT_SERVICE=entrypoint.Entrypoint/WorkflowTest
NAMESPACE="$RUNTIME"


call_to_entrypoint() {
    echo_send ">> sending msg..."

    start_call_time="$(date -u +%s)"

    ## GRPC CALL
    RESPONSE=$(echo '{}' | grpcurl -plaintext -d @ "$ENTRYPOINT_URL" "$ENTRYPOINT_SERVICE")

    end_call_time="$(date -u +%s)"
    elapsed_call_time=$(($end_call_time - $start_call_time))

    echo_receive "<< received response in ${elapsed_call_time}s"
    echo_gray "      ↪️ [response: $(echo "$RESPONSE" | tr -d '\n')]"

}

### Bash helpers
check_not_empty() {
  VARNAME=$1
  ERR=${2:-"Missing variable $VARNAME"}
  eval VALUE=\${$VARNAME}

  [ "$VALUE" != "" ] || (echo $ERR && exit 1)
  return 0
}

### Kubernetes function
get_entrypoint_pod() {
  kubectl -n $NAMESPACE get pod -l version-name="$VERSION",type=entrypoint -o custom-columns=":metadata.name" --no-headers
}

open_port_forward() {
  echo_info_header "opening port forward to entrypoint..."
  ENTRYPOINT_POD=$(get_entrypoint_pod)
  check_not_empty "ENTRYPOINT_POD" "missing entrypoint pod"

  # PICK A RANDOM PORT TO USE
  HOST_PORT=$(shuf -i 9001-9999 -n 1)
  ENTRYPOINT_URL=localhost:$HOST_PORT

  kubectl port-forward "$ENTRYPOINT_POD" "$HOST_PORT":9000 -n $NAMESPACE > /dev/null 2>&1 &
  PORT_FORWARD_PID=$?

  # NOTE: This sleep is important to wait until the port forward is really opened
  sleep 1
}

close_port_forward() {
  # STOPPING PORT FORWARD
  echo_info_header "closing port forward..."
  {
    sleep 0.2 && kill -s INT $PORT_FORWARD_PID && wait $PORT_FORWARD_PID
  } &
}

## PRINT FUNCTIONS
echo_info_header() {
  echo "👉 \033[34m$*\033[m"
}

echo_send() {
  echo "  ⏳ \033[33m$*\033[m"
}

echo_receive() {
  echo "  \033[32m✔ $*\033[m"
}

echo_gray() {
  echo "  \033[90m$*\033[m"
}

echo_done() {
  printf "  \033[92m✔ done\033[m\n"
}


# RUN ALL THE THINGS
open_port_forward
call_to_entrypoint
close_port_forward
echo_done
