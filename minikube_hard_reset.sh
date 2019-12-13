#!/bin/sh

. ./config.sh

while true; do
    read -p "Do you wish to delete the $MINIKUBE_PROFILE minikube profile? CAUTION: all runtimes data will be permanently deleted. 🔥 " yn
    case $yn in
        [Yy]* ) minikube delete -p $MINIKUBE_PROFILE; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y[yes] or n[no].";;
    esac
done
