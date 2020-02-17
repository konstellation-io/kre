#!/bin/sh

. ./config.sh

# Setup environment to build images inside minikube
eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"

# Clean unused containers and images inside minikube
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock docker:stable \
  /bin/sh -c 'docker container prune --filter "until=24h" -f && docker image prune -a --filter "until=24h" -f'
