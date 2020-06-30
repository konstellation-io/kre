
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

      run minikube addons enable ingress
      run minikube addons enable dashboard
      run minikube addons enable registry
      run minikube addons enable storage-provisioner
      run minikube addons enable metrics-server
    ;;
  esac
  MINIKUBE_CHECK=1
}

get_admin_api_pod() {
  kubectl -n kre get pod -l app=kre-local-admin-api -o custom-columns=":metadata.name" --no-headers
}

get_mongo_pod() {
  kubectl -n kre get pod -l app=mongodb -o custom-columns=":metadata.name" --no-headers
}

minikube_stop() {
  minikube -p "$MINIKUBE_PROFILE" stop
}

minikube_clean() {
  # Clean unused containers and images inside minikube
  echo_wait "Clean unused containers and images inside minikube"
  docker run --rm -it \
    -v /var/run/docker.sock:/var/run/docker.sock docker:stable \
    /bin/sh -c 'docker system prune --filter "until=24h" -f'
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
