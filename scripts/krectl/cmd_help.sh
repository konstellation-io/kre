#!/bin/sh

script_name=$(basename "$0")

show_help() {
  case $* in
    *dev*)
      show_dev_help
    ;;
    *login*)
      show_login_help
    ;;
    *build*)
      show_build_help
    ;;
    *deploy*)
      show_deploy_help
    ;;
    *delete*)
      show_delete_help
    ;;
    *)
      show_root_help
    ;;
  esac
}

help_global_header() {
  cmd=${1:-"<command>"}

  echo "  $(echo_green "${script_name}") -- a tool to manage KRE environment during development.

  syntax: $(echo_yellow "${script_name} ${cmd} [options]")"
}

help_global_options() {
  echo "global options:
      h     prints this help.
      v     verbose mode.
 "
}

show_root_help() {
   echo "$(help_global_header "")

    commands:
      dev     creates a complete local environment and auto-login to frontend.
      start   starts minikube kre profile.
      stop    stops minikube kre profile.
      login   creates a login URL and open your browser automatically on the admin page.
      build   calls docker to build all images inside minikube.
      deploy  calls helm to create install/upgrade a kre release on minikube.
      delete  calls kubectl to remove runtimes or versions.

    $(help_global_options)
"
}
