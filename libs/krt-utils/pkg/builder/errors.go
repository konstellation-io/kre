package builder

import "errors"

var ErrYamlNotFound = errors.New("no yaml file found")
var ErrInvalidVersionName = errors.New("invalid version name")
