package entity

import (
	"time"
)

type UserActivityType string

const (
	UserActivityTypeLogin                      UserActivityType = "LOGIN"
	UserActivityTypeLogout                     UserActivityType = "LOGOUT"
	UserActivityTypeCreateRuntime              UserActivityType = "CREATE_RUNTIME"
	UserActivityTypeCreateVersion              UserActivityType = "CREATE_VERSION"
	UserActivityTypePublishVersion             UserActivityType = "PUBLISH_VERSION"
	UserActivityTypeUnpublishVersion           UserActivityType = "UNPUBLISH_VERSION"
	UserActivityTypeStartVersion               UserActivityType = "START_VERSION"
	UserActivityTypeStopVersion                UserActivityType = "STOP_VERSION"
	UserActivityTypeUpdateSetting              UserActivityType = "UPDATE_SETTING"
	UserActivityTypeUpdateVersionConfiguration UserActivityType = "UPDATE_VERSION_CONFIGURATION"
	UserActivityTypeCreateUser                 UserActivityType = "CREATE_USER"
	UserActivityTypeRemoveUsers                UserActivityType = "REMOVE_USERS"
	UserActivityTypeUpdateAccessLevels         UserActivityType = "UPDATE_ACCESS_LEVELS"
	UserActivityTypeRevokeSessions             UserActivityType = "REVOKE_SESSIONS"
	UserActivityTypeGenerateAPIToken           UserActivityType = "GENERATE_API_TOKEN"
	UserActivityTypeDeleteAPIToken             UserActivityType = "DELETE_API_TOKEN"
)

func (e UserActivityType) IsValid() bool {
	switch e {
	case UserActivityTypeLogin, UserActivityTypeLogout, UserActivityTypeCreateVersion,
		UserActivityTypePublishVersion, UserActivityTypeUnpublishVersion, UserActivityTypeStartVersion,
		UserActivityTypeStopVersion, UserActivityTypeUpdateSetting, UserActivityTypeUpdateVersionConfiguration,
		UserActivityTypeCreateUser, UserActivityTypeRemoveUsers, UserActivityTypeUpdateAccessLevels,
		UserActivityTypeRevokeSessions, UserActivityTypeCreateRuntime, UserActivityTypeGenerateAPIToken,
		UserActivityTypeDeleteAPIToken:
		return true
	}

	return false
}

func (e UserActivityType) String() string {
	return string(e)
}

type UserActivityVar struct {
	Key   string `bson:"key"`
	Value string `bson:"value"`
}

type UserActivity struct {
	ID     string             `bson:"_id"`
	Date   time.Time          `bson:"date"`
	UserID string             `bson:"userId"`
	Type   UserActivityType   `bson:"type"`
	Vars   []*UserActivityVar `bson:"vars"`
}
