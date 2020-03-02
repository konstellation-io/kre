#!/bin/sh

MINIKUBE_PROFILE=${1:-minikube}

MINIKUBE_IP=$(minikube ip -p $MINIKUBE_PROFILE)

if [ -z "$MINIKUBE_IP" ]; then
  echo "If you are using a different profile run the script with the profile name."
  exit 1
fi

printf "\n👇 Add the following lines to your /etc/hosts\n"
echo "$MINIKUBE_IP api.kre.local"
echo "$MINIKUBE_IP admin.kre.local"
echo "127.0.0.1 dev-admin.kre.local"
echo
