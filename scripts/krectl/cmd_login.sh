#!/bin/sh

cmd_login() {
  minikube_start
  local_login
}

show_login_help() {
  echo "$(help_global_header "login")

    $(help_global_options)
"
}

local_login() {
  ADMIN_API_POD=$(get_admin_api_pod)
  check_not_empty "ADMIN_API_POD" "error getting Admin API pod"

  TOTAL_PODS=$(echo "$ADMIN_API_POD" | wc -l)

  if [ "${TOTAL_PODS}" -ne 1 ]; then
    echo "more than one pods exists. waiting...(you can kill the pod manually if this takes long)"
    sleep 5
    local_login
    return
  fi

  HOST="http://api.kre.local"
  SIGNIN_URL="$HOST/api/v1/auth/signin"

  echo_wait "Calling Admin API..."
  curl -s $SIGNIN_URL \
    -H 'pragma: no-cache' -H 'cache-control: no-cache' \
    -H 'accept: application/json, text/plain, */*' \
    -H 'content-type: application/json;charset=UTF-8' -H "origin: $HOST" \
    -H 'sec-fetch-site: same-site' -H 'sec-fetch-mode: cors' \
    -H "referer: $HOST/login" \
    --data-binary "{\"email\":\"$ADMIN_DEV_EMAIL\"}" >/dev/null 2>&1

  sleep 0.5

  WATCH_FILE=$(mktemp)

  echo_debug "watching $WATCH_FILE"
  echo_debug "waiting link log on pod: $ADMIN_API_POD"

  kubectl -n "${NAMESPACE}" logs "$ADMIN_API_POD" | tail -n 100 > "$WATCH_FILE"

  # Read the file in reverse order and capture the first signin link
  LINK=$(awk '{print NR" "$0}' < "$WATCH_FILE" | sort -k1 -n -r | sed 's/^[^ ]* //g' | egrep -oh "http://.*/signin/([^\"]*)" | head -n 1)

  rm "$WATCH_FILE"

  check_not_empty "LINK" "error watching for login link.  Usually this means that you forgot to update /etc/hosts"

  echo
  echo "Login done. Open your browser at:"
  echo
  echo "   🌎 ${LINK}"
  echo

  # Open browser automatically
  nohup xdg-open "$LINK" >/dev/null 2>&1 &
}
