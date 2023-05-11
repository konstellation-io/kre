package usecase

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/usecase_${GOFILE} -package=mocks

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/repository"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type UserActivityInteracter interface {
	Get(ctx context.Context, user *token.UserRoles, userEmail *string, types []entity.UserActivityType,
		versionIds []string, fromDate *string, toDate *string, lastID *string) ([]*entity.UserActivity, error)
	RegisterLogin(userID string) error
	RegisterLogout(userID string) error
	RegisterCreateProduct(userID string, product *entity.Product) error
	RegisterCreateAction(userID, productID string, version *entity.Version) error
	RegisterStartAction(userID, productID string, version *entity.Version, comment string) error
	RegisterStopAction(userID, productID string, version *entity.Version, comment string) error
	RegisterPublishAction(userID, productID string, version *entity.Version, prev *entity.Version, comment string) error
	RegisterUnpublishAction(userID, productID string, version *entity.Version, comment string) error
	RegisterUpdateSettings(userID string, vars []*entity.UserActivityVar) error
	//nolint:godox // Remove this statement when the TODO below is done.
	//TODO: Refactor accessLevel to type
	RegisterUpdateAccessLevels(userID string, userIDs, userEmails []string, newAccessLevel, comment string)
	RegisterRevokeSessions(userID string, userIDs, userEmails []string, comment string)
	NewUpdateSettingVars(settingName, oldValue, newValue string) []*entity.UserActivityVar
	RegisterGenerateAPIToken(userID, apiTokenName string) error
	RegisterDeleteAPIToken(userID, apiTokenName string) error
}

// UserActivityInteractor  contains app logic about UserActivity entities.
type UserActivityInteractor struct {
	logger           logging.Logger
	userActivityRepo repository.UserActivityRepo
	accessControl    auth.AccessControl
}

// NewUserActivityInteractor creates a new UserActivityInteractor.
func NewUserActivityInteractor(
	logger logging.Logger,
	userActivityRepo repository.UserActivityRepo,
	accessControl auth.AccessControl,
) UserActivityInteracter {
	return &UserActivityInteractor{
		logger,
		userActivityRepo,
		accessControl,
	}
}

// Get return a list of UserActivities.
func (i *UserActivityInteractor) Get(
	ctx context.Context,
	user *token.UserRoles,
	userEmail *string,
	types []entity.UserActivityType,
	versionIds []string,
	fromDate *string,
	toDate *string,
	lastID *string,
) ([]*entity.UserActivity, error) {
	if err := i.accessControl.CheckPermission(user, "", auth.ActViewUserActivities); err != nil {
		return nil, err
	}

	return i.userActivityRepo.Get(ctx, userEmail, types, versionIds, fromDate, toDate, lastID)
}

// Create add a new UserActivity to the given user.
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

func (i *UserActivityInteractor) RegisterCreateProduct(userID string, product *entity.Product) error {
	err := i.create(
		userID,
		entity.UserActivityTypeCreateRuntime,
		[]*entity.UserActivityVar{
			{
				Key:   "PRODUCT_ID",
				Value: product.ID,
			},
			{
				Key:   "RUNTIME_NAME",
				Value: product.Name,
			},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterCreateAction(userID, productID string, version *entity.Version) error {
	err := i.create(
		userID,
		entity.UserActivityTypeCreateVersion,
		[]*entity.UserActivityVar{
			{Key: "PRODUCT_ID", Value: productID},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterStartAction(userID, productID string, version *entity.Version, comment string) error {
	err := i.create(
		userID,
		entity.UserActivityTypeStartVersion,
		[]*entity.UserActivityVar{
			{Key: "PRODUCT_ID", Value: productID},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "COMMENT", Value: comment},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterStopAction(userID, productID string, version *entity.Version, comment string) error {
	err := i.create(
		userID,
		entity.UserActivityTypeStopVersion,
		[]*entity.UserActivityVar{
			{Key: "PRODUCT_ID", Value: productID},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "COMMENT", Value: comment},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterPublishAction(userID, productID string, version *entity.Version, prev *entity.Version, comment string) error {
	err := i.create(
		userID,
		entity.UserActivityTypePublishVersion,
		[]*entity.UserActivityVar{
			{Key: "PRODUCT_ID", Value: productID},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "OLD_PUBLISHED_VERSION_ID", Value: prev.ID},
			{Key: "OLD_PUBLISHED_VERSION_NAME", Value: prev.Name},
			{Key: "COMMENT", Value: comment},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *UserActivityInteractor) RegisterUnpublishAction(userID, productID string, version *entity.Version, comment string) error {
	err := i.create(
		userID,
		entity.UserActivityTypeUnpublishVersion,
		[]*entity.UserActivityVar{
			{Key: "PRODUCT_ID", Value: productID},
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

func (i *UserActivityInteractor) RegisterUpdateAccessLevels(userID string, userIDs, userEmails []string,
	newAccessLevel, comment string) {
	err := i.create(
		userID,
		entity.UserActivityTypeUpdateAccessLevels,
		[]*entity.UserActivityVar{
			{Key: "USER_IDS", Value: strings.Join(userIDs, ",")},
			{Key: "USER_EMAILS", Value: strings.Join(userEmails, ",")},
			{Key: "ACCESS_LEVEL", Value: newAccessLevel},
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
