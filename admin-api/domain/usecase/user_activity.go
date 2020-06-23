package usecase

import (
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/repository"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
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
func (i *UserActivityInteractor) Create(userID string, userActivityType entity.UserActivityType, vars []*entity.UserActivityVar) error {
	userActivity := entity.UserActivity{
		ID:     primitive.NewObjectID().Hex(),
		UserID: userID,
		Type:   userActivityType,
		Date:   time.Now(),
		Vars:   vars,
	}
	return i.userActivityRepo.Create(userActivity)
}

func checkUserActivityError(logger logging.Logger, err error) error {
	if err != nil {
		userActivityErr := fmt.Errorf("error creating userActivity: %w", err)
		logger.Error(userActivityErr.Error())
		return userActivityErr
	}
	return nil
}

func (i *UserActivityInteractor) RegisterLogin(userID string) error {
	err := i.Create(userID, entity.UserActivityTypeLogin, []*entity.UserActivityVar{})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterLogout(userID string) error {
	err := i.Create(userID, entity.UserActivityTypeLogout, []*entity.UserActivityVar{})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterCreateRuntime(userID string, runtime *entity.Runtime) error {
	err := i.Create(
		userID,
		entity.UserActivityTypeCreateRuntime,
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
		entity.UserActivityTypeCreateVersion,
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
		entity.UserActivityTypeStartVersion,
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
		entity.UserActivityTypeStopVersion,
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
		entity.UserActivityTypePublishVersion,
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
		entity.UserActivityTypeUnpublishVersion,
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
	err := i.Create(userID, entity.UserActivityTypeUpdateSetting, vars)
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterCreateUser(userID string, createdUser *entity.User) {
	err := i.Create(
		userID,
		entity.UserActivityTypeCreateUser,
		[]*entity.UserActivityVar{
			{Key: "CREATED_USER_ID", Value: createdUser.ID},
			{Key: "CREATED_USER_EMAIL", Value: createdUser.Email},
			{Key: "CREATED_USER_ACCESS_LEVEL", Value: createdUser.AccessLevel.String()},
		})
	_ = checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterRemoveUsers(userID string, userIDs, userEmails []string) {
	err := i.Create(
		userID,
		entity.UserActivityTypeRemoveUsers,
		[]*entity.UserActivityVar{
			{Key: "USER_IDS", Value: strings.Join(userIDs, ",")},
			{Key: "USER_EMAILS", Value: strings.Join(userEmails, ",")},
		})
	_ = checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterUpdateAccessLevels(userID string, userIDs, userEmails []string, newAccessLevel entity.AccessLevel) {
	err := i.Create(
		userID,
		entity.UserActivityTypeUpdateAccessLevels,
		[]*entity.UserActivityVar{
			{Key: "USER_IDS", Value: strings.Join(userIDs, ",")},
			{Key: "USER_EMAILS", Value: strings.Join(userEmails, ",")},
			{Key: "ACCESS_LEVEL", Value: newAccessLevel.String()},
		})
	_ = checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterRevokeSessions(userID string, userIDs, userEmails []string) {
	err := i.Create(
		userID,
		entity.UserActivityTypeRevokeSessions,
		[]*entity.UserActivityVar{
			{Key: "USER_IDS", Value: strings.Join(userIDs, ",")},
			{Key: "USER_EMAILS", Value: strings.Join(userEmails, ",")},
		})
	_ = checkUserActivityError(i.logger, err)
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
