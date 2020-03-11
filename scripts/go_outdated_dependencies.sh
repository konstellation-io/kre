#!/bin/bash

# https://github.com/golang/go/wiki/Modules#how-to-upgrade-and-downgrade-dependencies

go list -u -f '{{if (and (not (or .Main .Indirect)) .Update)}}{{.Path}}: {{.Version}} -> {{.Update.Version}}{{end}}' -m all 2> /dev/null
