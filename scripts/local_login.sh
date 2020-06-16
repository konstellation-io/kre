#/bin/sh

. ./scripts/functions.sh

HOST="http://api.kre.local"
SIGNIN_URL="$HOST/api/v1/auth/signin"
DEV_EMAIL="dev@local.local"
ADMIN_API_POD=$(kubectl -n kre get pod -l app=kre-local-admin-api -o custom-columns=":metadata.name" --no-headers)

MONGO_POD=$(kubectl -n kre get pod -l app=mongodb -o custom-columns=":metadata.name" --no-headers)
MONGO_DB=localKRE
MONGO_USER="admin"
MONGO_PASS=123456


create_user_mongo_script() {
  echo "db.getCollection('users').update({ \"_id\": \"local_login_user\" }, {\"\$set\": { \"email\": \"$DEV_EMAIL\", \"deleted\": false, \"accessLevel\": \"ADMIN\", \"creationDate\": ISODate(\"2020-06-15T10:45:54.528Z\") }}, { \"upsert\": true })"
}

create_user_mongo_script | kubectl exec -n kre -it $MONGO_POD -- mongo --quiet -u $MONGO_USER -p $MONGO_PASS $MONGO_DB >/dev/null 2>&1

echo "calling api..."
curl -s $SIGNIN_URL \
  -H 'pragma: no-cache' -H 'cache-control: no-cache' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'content-type: application/json;charset=UTF-8' -H "origin: $HOST" \
  -H 'sec-fetch-site: same-site' -H 'sec-fetch-mode: cors' \
  -H "referer: $HOST/login" \
  --data-binary "{\"email\":\"$DEV_EMAIL\"}" >/dev/null 2>&1

sleep 0.5

WATCH_FILE=$(mktemp)

echo "watching $WATCH_FILE"
echo "pod $ADMIN_API_POD"
kubectl -n kre logs $ADMIN_API_POD | tail -n 100 >$WATCH_FILE

# Read the file in reverse order and capture the first signin link
LINK=$(cat $WATCH_FILE | awk '{print NR" "$0}' | sort -k1 -n -r | sed 's/^[^ ]* //g' | egrep -oh "http://.*/signin/([^\"]*)" | head -n 1)

rm $WATCH_FILE

printf "\n Login done. Open your browser at: \n\n 🌎 $LINK\n"

# Open browser automacally
nohup xdg-open $LINK >/dev/null 2>&1 &

echo_green "\n✔️  Done.\n\n"
