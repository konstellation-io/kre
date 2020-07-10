#!/bin/sh

cmd_etchost() {
  if [ "$HOSTCTL_INSTALLED" = "1" ] ; then
    # Automatic update of /etc/hosts
    update_etc_hosts
  else
    show_etc_hosts
    echo_info "After that you can run \`$(basename $0) login \` to access Admin UI"
    echo
    echo_yellow "This can be automated with 'hostctl' tool. Download it from here: https://github.com/guumaster/hostctl/releases"
  fi
}

show_etchost_help() {
  echo "$(help_global_header "etchost")

    $(help_global_options)
"
}

update_etc_hosts() {
  MINIKUBE_IP=$(minikube ip -p "$MINIKUBE_PROFILE")
  echo "$MINIKUBE_IP api.kre.local
$MINIKUBE_IP admin.kre.local
# If you are using local frontend
127.0.0.1 dev-admin.kre.local
" > /tmp/kre.hostctl

  SUDO=''
  if [ $(whoami) != "root" ]; then
    echo_info "Updating /etc/hosts requires admin privileges. Running command with sudo"
    SUDO='sudo'
  fi
  run $SUDO hostctl replace kre -f /tmp/kre.hostctl
}

show_etc_hosts() {
  MINIKUBE_IP=$(minikube ip -p "$MINIKUBE_PROFILE")

  if [ -z "$MINIKUBE_IP" ]; then
    echo_warning "If you are using a different profile run the script with the profile name."
    return
  fi
  echo
  echo_info "👇 Add the following lines to your /etc/hosts"
  echo
  echo "$MINIKUBE_IP api.kre.local"
  echo "$MINIKUBE_IP admin.kre.local"
  echo "127.0.0.1 dev-admin.kre.local # If you are using local frontend"
  echo
}
