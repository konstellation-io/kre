#!/bin/sh

kubectl -n kre logs -f $(kubectl -n kre get pod -l app=kre-local-admin-api -o custom-columns=":metadata.name" --no-headers) | egrep -oh "http://admin-kre.local/signin/([^\"]*)"

