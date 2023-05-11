package auth

import "github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"

//go:generate mockgen -source=${GOFILE} -destination=../../../mocks/auth_${GOFILE} -package=mocks

type AccessControlResource string

const ResMetrics AccessControlResource = "metrics"
const ResRuntime AccessControlResource = "runtimes"
const ResVersion AccessControlResource = "versions"
const ResSettings AccessControlResource = "settings"
const ResUsers AccessControlResource = "users"
const ResAudit AccessControlResource = "audits"
const ResLogs AccessControlResource = "logs"

func (e AccessControlResource) IsValid() bool {
	switch e {
	case ResMetrics, ResRuntime, ResVersion, ResSettings, ResUsers, ResAudit, ResLogs:
		return true
	}

	return false
}

func (e AccessControlResource) String() string {
	return string(e)
}

type AccessControlAction string

const ActViewProduct AccessControlAction = "view_product"
const ActCreateProduct AccessControlAction = "create_product"

const ActCreateVersion AccessControlAction = "create_version"
const ActStartVersion AccessControlAction = "start_version"
const ActStopVersion AccessControlAction = "stop_version"
const ActPublishVersion AccessControlAction = "publish_version"
const ActUnpublishVersion AccessControlAction = "unpublish_version"
const ActEditVersion AccessControlAction = "edit_version"
const ActViewVersion AccessControlAction = "view_version"

const ActViewMetrics AccessControlAction = "view_metrics"
const ActViewUserActivities AccessControlAction = "view_user_activities"

const ActView AccessControlAction = "view"
const ActEdit AccessControlAction = "edit"

func (e AccessControlAction) IsValid() bool {
	switch e {
	case ActView, ActEdit, ActCreateProduct, ActStartVersion, ActStopVersion,
		ActPublishVersion, ActUnpublishVersion, ActEditVersion, ActViewMetrics,
		ActViewUserActivities, ActViewProduct, ActCreateVersion, ActViewVersion:
		return true
	}

	return false
}

func (e AccessControlAction) String() string {
	return string(e)
}

//nolint:godox // Remove this nolint statement after the TODO is done.
type AccessControl interface { // TODO: move to middleware.
	CheckPermission(user *token.UserRoles, product string, action AccessControlAction) error
}
