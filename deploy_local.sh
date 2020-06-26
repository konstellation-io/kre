#!/bin/sh

# SHOW DEPRECATION NOTICE

. ./scripts/krectl/common_functions.sh

OLD=`echo_yellow "deploy_local.sh"`
NEW=`echo_green "krectl.sh"`

echo "\n"
echo_warning "NOTICE:"
echo "\n\t$OLD IS DEPRECATED. \n\tUse $NEW."

echo "\n"
