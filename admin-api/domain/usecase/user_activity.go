package usecase

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
)

// UserActivityType enumerate all possible types
type UserActivityType string

const (
	UserActivityTypeLogin            UserActivityType = "LOGIN"
	UserActivityTypeLogout           UserActivityType = "LOGOUT"
	UserActivityTypeCreateRuntime    UserActivityType = "CREATE_RUNTIME"
	UserActivityTypeCreateVersion    UserActivityType = "CREATE_VERSION"
	UserActivityTypePublishVersion   UserActivityType = "PUBLISH_VERSION"
	UserActivityTypeUnpublishVersion UserActivityType = "UNPUBLISH_VERSION"
	UserActivityTypeStopVersion      UserActivityType = "STOP_VERSION"
	UserActivityTypeStartVersion     UserActivityType = "START_VERSION"
	UserActivityTypeUpdateSetting    UserActivityType = "UPDATE_SETTING"
)

// UserActivityInteractor  contains app logic about UserActivity entities
type UserActivityInteractor struct {
	logger           logging.Logger
	userActivityRepo repository.UserActivityRepo
	userRepo         repository.UserRepo
}

// NewUserActivityInteractor creates a new UserActivityInteractor
func NewUserActivityInteractor(
	logger logging.Logger,
	userActivityRepo repository.UserActivityRepo,
	userRepo repository.UserRepo,
) *UserActivityInteractor {
	return &UserActivityInteractor{
		logger,
		userActivityRepo,
		userRepo,
	}
}

// Get return a list of UserActivities
func (i *UserActivityInteractor) Get(userEmail *string, activityType *string, fromDate *string, toDate *string, lastID *string) ([]*entity.UserActivity, error) {
	return i.userActivityRepo.Get(userEmail, activityType, fromDate, toDate, lastID)
}

// Create add a new UserActivity to the given user
func (i *UserActivityInteractor) Create(userID string, userActivityType UserActivityType, vars []*entity.UserActivityVar) error {
	userActivity := entity.UserActivity{
		ID:     primitive.NewObjectID().Hex(),
		UserID: userID,
		Type:   string(userActivityType),
		Date:   time.Now(),
		Vars:   vars,
	}
	return i.userActivityRepo.Create(userActivity)
}

func checkUserActivityError(logger logging.Logger, err error) error {
	if err != nil {
		logger.Error("error creating userActivity")
		return fmt.Errorf("error creating userActivity: %w", err)
	}
	return nil
}

func (i *UserActivityInteractor) RegisterLogin(userID string) error {
	err := i.Create(userID, UserActivityTypeLogin, []*entity.UserActivityVar{})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterLogout(userID string) error {
	err := i.Create(userID, UserActivityTypeLogout, []*entity.UserActivityVar{})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterCreateRuntime(userID string, runtime *entity.Runtime) error {
	err := i.Create(
		userID,
		UserActivityTypeCreateRuntime,
		[]*entity.UserActivityVar{
			{
				Key:   "RUNTIME_ID",
				Value: runtime.ID,
			},
			{
				Key:   "RUNTIME_NAME",
				Value: runtime.Name,
			},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterCreateAction(userID string, runtime *entity.Runtime, version *entity.Version) error {
	err := i.Create(
		userID,
		UserActivityTypeCreateVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterStartAction(userID string, runtime *entity.Runtime, version *entity.Version, comment string) error {
	err := i.Create(
		userID,
		UserActivityTypeStartVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "COMMENT", Value: comment},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterStopAction(userID string, runtime *entity.Runtime, version *entity.Version, comment string) error {
	err := i.Create(
		userID,
		UserActivityTypeStopVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "COMMENT", Value: comment},
		})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterPublishAction(userID string, runtime *entity.Runtime, version *entity.Version, prev *entity.Version, comment string) error {
	err := i.Create(
		userID,
		UserActivityTypePublishVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "OLD_PUBLISHED_VERSION_ID", Value: prev.ID},
			{Key: "OLD_PUBLISHED_VERSION_NAME", Value: prev.Name},
			{Key: "COMMENT", Value: comment},
		})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterUnpublishAction(userID string, runtime *entity.Runtime, version *entity.Version, comment string) error {
	err := i.Create(
		userID,
		UserActivityTypeUnpublishVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "COMMENT", Value: comment},
		})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterUpdateSettings(userID string, vars []*entity.UserActivityVar) error {
	err := i.Create(userID, UserActivityTypeUpdateSetting, vars)
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) NewUpdateSettingVars(settingName, oldValue, newValue string) []*entity.UserActivityVar {
	return []*entity.UserActivityVar{
		{
			Key:   "SETTING_NAME",
			Value: settingName,
		},
		{
			Key:   "OLD_VALUE",
			Value: oldValue,
		},
		{
			Key:   "NEW_VALUE",
			Value: newValue,
		},
	}
}
