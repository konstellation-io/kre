#!/bin/sh
# ----
# File:        make-kre-user-admin.sh
# Description: Script to make an existing user ADMIN on the KRE database.
#              The script takes an email as input and prints the updated line
#              if the change is applied.
# Author:      Sergio Talens-Oliag <sergio.talens@intelygenz.com>
# ----

set -e

# ---------
# FUNCTIONS
# ---------

usage() {
  cat <<EOF

Usage: $0 EMAIL

On a new development environment call:

  $0 dev@local.local

EOF
  exit "$1"
}

# ----
# MAIN
# ----

# Default return value
ret=0

# Process arguments
EMAIL="$1"

case "$EMAIL" in
*@*) ;;
"") usage 0 ;;
*) usage 1 ;;
esac

# Get mongodb password
PASS="$(
  kubectl get -n kre secrets/mongodb-database-admin-password \
  -o jsonpath="{.data.password}" | base64 --decode
)" || true


if [ "$PASS" ]; then
  # Update user command
  UPDT_ARGS="{\"email\":\"$EMAIL\"}, {\$set: {\"accessLevel\": \"ADMIN\"}}"
  UPDT_CMND="db.users.updateOne($UPDT_ARGS)"
  # Find user command
  FIND_ARGS="{\"email\":\"$EMAIL\"}"
  FIND_CMND="db.users.find($FIND_ARGS)"
  # Combined command (update and then find)
  CMND="$UPDT_CMND; $FIND_CMND"
  # Execute mongo command on the mongodb server container, if there is no
  # output the user was not found
  OUTPUT="$(
    kubectl exec -ti pod/mongodb-database-0 -c mongod -- mongo --quiet \
      -u admin -p "$PASS" --authenticationDatabase admin kre --eval "$CMND"
  )"
  if [ "$OUTPUT" ]; then
    echo "$OUTPUT"
  else
    echo "User '$EMAIL' not found"
    ret=1
  fi
else
  echo "No mongodb password found, aborting!"
  ret=1
fi

exit "$ret"

# ----
# vim: ts=2:sw=2:et:ai:sts=2
