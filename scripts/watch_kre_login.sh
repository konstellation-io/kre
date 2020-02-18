#!/bin/sh

echo "DEPRECATED: Use ./scripts/local_login.sh to do it automagically\n"
#kubectl -n kre logs -f $(kubectl -n kre get pod -l app=kre-local-admin-api -o custom-columns=":metadata.name" --no-headers) | egrep -oh "http://.*/signin/([^\"]*)"
