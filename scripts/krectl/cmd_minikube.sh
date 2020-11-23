
minikube_hard_reset() {
  while true; do
    read -p "⚠️  Do you wish to delete the $MINIKUBE_PROFILE minikube profile? CAUTION: all data will be permanently deleted. 🔥" yn
    case $yn in
    [Yy]*)
      dracarys_header && minikube delete -p "$MINIKUBE_PROFILE"
      break
      ;;
    [Nn]*) exit ;;
    *) echo "Please answer y[yes] or n[no]." ;;
    esac
  done
}

MINIKUBE_CHECK=0
minikube_start() {
  if [ "$MINIKUBE_CHECK" = "1" ]; then
    return
  fi

  MINIKUBE_STATUS=$(minikube status -p "$MINIKUBE_PROFILE" | grep apiserver | cut -d ' ' -f 2)

  case $MINIKUBE_STATUS in
    Running)
      echo_check "Minikube already running"
    ;;
    Stopped)
      echo_check "Restarting minikube profile"
      minikube start -p "$MINIKUBE_PROFILE"
    ;;
    *)
      echo_wait "Creating new minikube profile"
      minikube start -p "$MINIKUBE_PROFILE" \
        --cpus="$MINIKUBE_CPUS" \
        --memory="$MINIKUBE_MEMORY" \
        --kubernetes-version="$MINIKUBE_KUBERNETES_VERSION" \
        --disk-size="$MINIKUBE_DISK_SIZE" \
        --driver="$MINIKUBE_DRIVER" \
        --extra-config=apiserver.authorization-mode=RBAC

      run minikube addons enable ingress -p "$MINIKUBE_PROFILE"
      run minikube addons enable registry -p "$MINIKUBE_PROFILE"
      run minikube addons enable storage-provisioner -p "$MINIKUBE_PROFILE"
      run minikube addons enable metrics-server -p "$MINIKUBE_PROFILE"
      cmd_etchost
    ;;
  esac
  MINIKUBE_CHECK=1
}

get_admin_api_pod() {
  kubectl -n ${NAMESPACE} get pod -l app=${RELEASE_NAME}-admin-api -o custom-columns=":metadata.name" --no-headers
}

get_mongo_pod() {
  kubectl -n ${NAMESPACE} get pod -l app=${NAMESPACE}-mongo -o custom-columns=":metadata.name" --no-headers
}

minikube_stop() {
  minikube -p "$MINIKUBE_PROFILE" stop
}

minikube_clean() {
  eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"
  KEEP_THRESHOLD_HOURS="12"
  # Clean unused containers and images inside minikube
  echo_wait "Clean unused containers and images inside minikube"
  docker run --rm -it \
    -v /var/run/docker.sock:/var/run/docker.sock docker:stable \
    /bin/sh -c "docker system prune --filter \"until=${KEEP_THRESHOLD_HOURS}h\" -f"

  unset DOCKER_TLS_VERIFY DOCKER_HOST DOCKER_CERT_PATH MINIKUBE_ACTIVE_DOCKERD
}

dracarys_header() {
  echo "          ____ __"
  echo "         { --.\  |          .)%%%)%%"
  echo "          '-._\\ | (\___   %)%%(%%(%%%"
  echo '🔥DRACARYS🔥  `\\|{/ ^ _)-%(%%%%)%%;%%%'
  echo "          .'^^^^^^^  /\`    %%)%%%%)%%%'"
  echo "         //\   ) ,  /       '%%%%(%%'"
  echo "   ,  _.'/  \`\<-- \<"
  echo "    \`^^^\`     ^^   ^^"
}
