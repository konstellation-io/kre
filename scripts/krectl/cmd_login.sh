#!/bin/sh

cmd_login() {
  case $* in
  *--new*)
    new_admin_user
    ;;
  esac

  minikube_start
  local_login
}

show_login_help() {
  echo "$(help_global_header "login")

    options:
      --new  creates a new user and reset admin pod before performing a login.

    $(help_global_options)
"
}

new_admin_user() {
  echo_wait "Collecting pods info..."

  ADMIN_API_POD=$(get_admin_api_pod)
  check_not_empty "ADMIN_API_POD" "error getting Admin API pod"

  MONGO_POD=$(get_mongo_pod)
  check_not_empty "MONGO_POD" "error getting MongoDB pod"

  MONGO_CREATE_USER_SCRIPT="
  db.getCollection('users').remove({ \"email\": \"$ADMIN_DEV_EMAIL\" });
  db.getCollection('users').update(
    { \"_id\": \"local_login_user\" },
    {
      \"\$set\": {
        \"email\": \"$ADMIN_DEV_EMAIL\",
        \"deleted\": false,
        \"accessLevel\": \"ADMIN\",
        \"creationDate\": ISODate(\"2020-06-15T10:45:54.528Z\")
      }
    },
    { \"upsert\": true }
  )"

  echo_wait "Creating '$ADMIN_DEV_EMAIL' user..."
  echo "$MONGO_CREATE_USER_SCRIPT" | run kubectl exec -n kre -it "$MONGO_POD" \
    -- mongo --quiet -u "$MONGO_USER" -p "$MONGO_PASS" "$MONGO_DB"

  # Reset AdminAPI to load permissions
  echo_wait "Resetting admin pod to reload permissions..."
  run kubectl delete pod "$ADMIN_API_POD" -n kre --grace-period 0
}

local_login() {
  ADMIN_API_POD=$(get_admin_api_pod)
  check_not_empty "ADMIN_API_POD" "error getting Admin API pod"

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

  kubectl -n kre logs "$ADMIN_API_POD" | tail -n 100 > "$WATCH_FILE"

  # Read the file in reverse order and capture the first signin link
  LINK=$(awk '{print NR" "$0}' < "$WATCH_FILE" | sort -k1 -n -r | sed 's/^[^ ]* //g' | egrep -oh "http://.*/signin/([^\"]*)" | head -n 1)

  rm "$WATCH_FILE"

  check_not_empty "LINK" "error watching for login link"

  echo
  echo "Login done. Open your browser at:"
  echo
  echo "   🌎 ${LINK}"
  echo

  # Open browser automatically
  nohup xdg-open "$LINK" >/dev/null 2>&1 &
}
