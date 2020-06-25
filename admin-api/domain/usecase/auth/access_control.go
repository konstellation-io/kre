package auth

import "errors"

type AccessControlResource string

const ResMetrics AccessControlResource = "metrics"
const ResResourceMetrics AccessControlResource = "resource-metrics"
const ResRuntime AccessControlResource = "runtime"
const ResVersion AccessControlResource = "version"
const ResSettings AccessControlResource = "settings"
const ResUsers AccessControlResource = "users"
const ResAudit AccessControlResource = "audit"
const ResLogs AccessControlResource = "logs"

type AccessControlAction string

const ActView AccessControlAction = "view"
const ActEdit AccessControlAction = "edit"

var (
	ErrViewMetrics         = errors.New("you are not allowed to view metrics")
	ErrViewResourceMetrics = errors.New("you are not allowed to view resource-metrics")
	ErrEditRuntimes        = errors.New("you are not allowed to edit runtimes")
	ErrViewRuntimes        = errors.New("you are not allowed to view runtimes")
	ErrEditSettings        = errors.New("you are not allowed to edit settings")
	ErrViewSettings        = errors.New("you are not allowed to view settings")
	ErrViewUsers           = errors.New("you are not allowed to view users")
	ErrEditUsers           = errors.New("you are not allowed to edit users")
	ErrViewAudit           = errors.New("you are not allowed to view audit")
	ErrEditVersions        = errors.New("you are not allowed to edit versions")
	ErrViewVersions        = errors.New("you are not allowed to view versions")
	ErrViewLogs            = errors.New("you are not allowed to view logs")
)

type AccessControl interface {
	CheckPermission(userID string, resource AccessControlResource, action AccessControlAction) bool
	ReloadUserRoles() error
}
