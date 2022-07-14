package usecase

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/usecase_${GOFILE} -package=mocks

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/repository"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type UserActivityInteracter interface {
	Get(ctx context.Context, loggedUserID string, userEmail *string, types []entity.UserActivityType,
		versionIds []string, fromDate *string, toDate *string, lastID *string) ([]*entity.UserActivity, error)
	RegisterLogin(userID string) error
	RegisterLogout(userID string) error
	RegisterCreateRuntime(userID string, runtime *entity.Runtime) error
	RegisterCreateAction(userID, runtimeId string, version *entity.Version) error
	RegisterStartAction(userID, runtimeId string, version *entity.Version, comment string) error
	RegisterStopAction(userID, runtimeId string, version *entity.Version, comment string) error
	RegisterPublishAction(userID, runtimeId string, version *entity.Version, prev *entity.Version, comment string) error
	RegisterUnpublishAction(userID, runtimeId string, version *entity.Version, comment string) error
	RegisterUpdateSettings(userID string, vars []*entity.UserActivityVar) error
	RegisterCreateUser(userID string, createdUser *entity.User)
	RegisterRemoveUsers(userID string, userIDs, userEmails []string, comment string)
	RegisterUpdateAccessLevels(userID string, userIDs, userEmails []string, newAccessLevel entity.AccessLevel, comment string)
	RegisterRevokeSessions(userID string, userIDs, userEmails []string, comment string)
	NewUpdateSettingVars(settingName, oldValue, newValue string) []*entity.UserActivityVar
	RegisterGenerateAPIToken(userID, apiTokenName string) error
	RegisterDeleteAPIToken(userID, apiTokenName string) error
}

// UserActivityInteractor  contains app logic about UserActivity entities
type UserActivityInteractor struct {
	logger           logging.Logger
	userActivityRepo repository.UserActivityRepo
	userRepo         repository.UserRepo
	accessControl    auth.AccessControl
}

// NewUserActivityInteractor creates a new UserActivityInteractor
func NewUserActivityInteractor(
	logger logging.Logger,
	userActivityRepo repository.UserActivityRepo,
	userRepo repository.UserRepo,
	accessControl auth.AccessControl,
) UserActivityInteracter {
	return &UserActivityInteractor{
		logger,
		userActivityRepo,
		userRepo,
		accessControl,
	}
}

// Get return a list of UserActivities
func (i *UserActivityInteractor) Get(
	ctx context.Context,
	loggedUserID string,
	userEmail *string,
	types []entity.UserActivityType,
	versionIds []string,
	fromDate *string,
	toDate *string,
	lastID *string,
) ([]*entity.UserActivity, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResAudit, auth.ActView); err != nil {
		return nil, err
	}

	var userIDs []string
	if userEmail != nil && *userEmail != "" {
		users, err := i.userRepo.GetManyByEmail(ctx, *userEmail)
		if err != nil {
			return nil, err
		}

		if len(users) > 0 {
			userIDs = make([]string, len(users))
			for i, u := range users {
				userIDs[i] = u.ID
			}
		}
	}

	return i.userActivityRepo.Get(ctx, userIDs, types, versionIds, fromDate, toDate, lastID)
}

// Create add a new UserActivity to the given user
func (i *UserActivityInteractor) create(userID string, userActivityType entity.UserActivityType, vars []*entity.UserActivityVar) error {
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
	err := i.create(userID, entity.UserActivityTypeLogin, []*entity.UserActivityVar{})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterLogout(userID string) error {
	err := i.create(userID, entity.UserActivityTypeLogout, []*entity.UserActivityVar{})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterCreateRuntime(userID string, runtime *entity.Runtime) error {
	err := i.create(
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

func (i *UserActivityInteractor) RegisterCreateAction(userID, runtimeId string, version *entity.Version) error {
	err := i.create(
		userID,
		entity.UserActivityTypeCreateVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtimeId},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterStartAction(userID, runtimeId string, version *entity.Version, comment string) error {
	err := i.create(
		userID,
		entity.UserActivityTypeStartVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtimeId},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "COMMENT", Value: comment},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterStopAction(userID, runtimeId string, version *entity.Version, comment string) error {
	err := i.create(
		userID,
		entity.UserActivityTypeStopVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtimeId},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "COMMENT", Value: comment},
		})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterPublishAction(userID, runtimeId string, version *entity.Version, prev *entity.Version, comment string) error {
	err := i.create(
		userID,
		entity.UserActivityTypePublishVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtimeId},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "OLD_PUBLISHED_VERSION_ID", Value: prev.ID},
			{Key: "OLD_PUBLISHED_VERSION_NAME", Value: prev.Name},
			{Key: "COMMENT", Value: comment},
		})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterUnpublishAction(userID, runtimeId string, version *entity.Version, comment string) error {
	err := i.create(
		userID,
		entity.UserActivityTypeUnpublishVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtimeId},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "COMMENT", Value: comment},
		})
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterUpdateSettings(userID string, vars []*entity.UserActivityVar) error {
	err := i.create(userID, entity.UserActivityTypeUpdateSetting, vars)
	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterCreateUser(userID string, createdUser *entity.User) {
	err := i.create(
		userID,
		entity.UserActivityTypeCreateUser,
		[]*entity.UserActivityVar{
			{Key: "CREATED_USER_ID", Value: createdUser.ID},
			{Key: "CREATED_USER_EMAIL", Value: createdUser.Email},
			{Key: "CREATED_USER_ACCESS_LEVEL", Value: createdUser.AccessLevel.String()},
		})
	_ = checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterRemoveUsers(userID string, userIDs, userEmails []string, comment string) {
	err := i.create(
		userID,
		entity.UserActivityTypeRemoveUsers,
		[]*entity.UserActivityVar{
			{Key: "USER_IDS", Value: strings.Join(userIDs, ",")},
			{Key: "USER_EMAILS", Value: strings.Join(userEmails, ",")},
			{Key: "COMMENT", Value: comment},
		})
	_ = checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterUpdateAccessLevels(userID string, userIDs, userEmails []string, newAccessLevel entity.AccessLevel, comment string) {
	err := i.create(
		userID,
		entity.UserActivityTypeUpdateAccessLevels,
		[]*entity.UserActivityVar{
			{Key: "USER_IDS", Value: strings.Join(userIDs, ",")},
			{Key: "USER_EMAILS", Value: strings.Join(userEmails, ",")},
			{Key: "ACCESS_LEVEL", Value: newAccessLevel.String()},
			{Key: "COMMENT", Value: comment},
		})
	_ = checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterRevokeSessions(userID string, userIDs, userEmails []string, comment string) {
	err := i.create(
		userID,
		entity.UserActivityTypeRevokeSessions,
		[]*entity.UserActivityVar{
			{Key: "USER_IDS", Value: strings.Join(userIDs, ",")},
			{Key: "USER_EMAILS", Value: strings.Join(userEmails, ",")},
			{Key: "COMMENT", Value: comment},
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

func (i *UserActivityInteractor) RegisterGenerateAPIToken(userID, apiTokenName string) error {
	err := i.create(
		userID,
		entity.UserActivityTypeGenerateAPIToken,
		[]*entity.UserActivityVar{
			{Key: "API_TOKEN_NAME", Value: apiTokenName},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterDeleteAPIToken(userID, apiTokenName string) error {
	err := i.create(
		userID,
		entity.UserActivityTypeDeleteAPIToken,
		[]*entity.UserActivityVar{
			{Key: "API_TOKEN_NAME", Value: apiTokenName},
		})

	return checkUserActivityError(i.logger, err)
}
