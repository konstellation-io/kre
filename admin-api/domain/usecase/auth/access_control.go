package auth

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

type AccessControl interface {
	CheckPermission(userID string, resource AccessControlResource, action AccessControlAction) error
	ReloadUserRoles() error
}
