package errors

import "errors"

var ErrInvalidObjectStoreName = errors.New("invalid object store name")
var ErrInvalidObjectStoreScope = errors.New("invalid object store scope")
var ErrInvalidKeyValueStoreScope = errors.New("invalid key-value store scope")
var ErrEmptyWorkflow = errors.New("workflow name cannot be empty")
var ErrEmptyEntrypointService = errors.New("workflow entrypoint service cannot be empty")
var ErrEmptyNodeName = errors.New("node name cannot be empty")
