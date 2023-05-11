package auth

import "errors"

//nolint:gochecknoglobals,stylecheck // needs to be global
var invalidAccessControlActionError = errors.New("invalid AccessControlAction")
