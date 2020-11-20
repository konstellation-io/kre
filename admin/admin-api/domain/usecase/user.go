package usecase

import (
	"context"
	"errors"
	"fmt"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/repository"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
)

// UserInteractor contains app logic to handle User entities
type UserInteractor struct {
	logger                 logging.Logger
	userRepo               repository.UserRepo
	userActivityInteractor UserActivityInteracter
	sessionRepo            repository.SessionRepo
	apiTokenRepo           repository.APITokenRepo
	accessControl          auth.AccessControl
	authInteractor         AuthInteracter
}

// NewUserInteractor creates a new UserInteractor
func NewUserInteractor(
	logger logging.Logger,
	userRepo repository.UserRepo,
	userActivityInteractor UserActivityInteracter,
	sessionRepo repository.SessionRepo,
	apiTokenRepo repository.APITokenRepo,
	accessControl auth.AccessControl,
	authInteractor AuthInteracter,
) *UserInteractor {
	return &UserInteractor{
		logger,
		userRepo,
		userActivityInteractor,
		sessionRepo,
		apiTokenRepo,
		accessControl,
		authInteractor,
	}
}

// GetByID returns a User by its ID
func (i *UserInteractor) GetByID(userID string) (*entity.User, error) {
	return i.userRepo.GetByID(userID)
}

// GetByIDs returns a list of User by IDs
func (i *UserInteractor) GetByIDs(userIDs []string) ([]*entity.User, error) {
	return i.userRepo.GetByIDs(userIDs)
}

// GetTokensByUserID returns a list of User by IDs
func (i *UserInteractor) GetTokensByUserID(ctx context.Context, userID string) ([]*entity.APIToken, error) {
	return i.apiTokenRepo.GetByUserID(ctx, userID)
}

// GetFirstAdmin returns first user with admin
func (i *UserInteractor) GetFirstAdmin(ctx context.Context) (*entity.User, error) {
	users, err := i.userRepo.GetByAccessLevel(ctx, entity.AccessLevelAdmin)
	if err != nil {
		return nil, err
	}
	if len(users) < 1 {
		return nil, ErrUserNotFound
	}

	return users[0], nil
}

// GetAllUsers returns all existing Users
func (i *UserInteractor) GetAllUsers(ctx context.Context, loggedUserID string, returnDeleted bool) ([]*entity.User, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResUsers, auth.ActView); err != nil {
		return nil, err
	}

	return i.userRepo.GetAll(ctx, returnDeleted)
}

func (i *UserInteractor) UpdateAccessLevel(ctx context.Context, userIDs []string, newAccessLevel entity.AccessLevel, loggedUserID string, comment string) ([]*entity.User, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResUsers, auth.ActEdit); err != nil {
		return nil, err
	}

	users, err := i.userRepo.GetByIDs(userIDs)
	if err != nil {
		return nil, err
	}

	if len(userIDs) != len(users) {
		return nil, errors.New("some user identifiers are not valid")
	}

	i.logger.Infof("Set access level to %s for %d users", newAccessLevel, len(users))

	updatedUsers, err := i.userRepo.UpdateAccessLevel(ctx, userIDs, newAccessLevel)
	if err != nil {
		return nil, err
	}

	updatedUserIDs := make([]string, len(users))
	updatedUserEmails := make([]string, len(users))
	for i, u := range users {
		updatedUserIDs[i] = u.ID
		updatedUserEmails[i] = u.Email
	}
	i.userActivityInteractor.RegisterUpdateAccessLevels(loggedUserID, updatedUserIDs, updatedUserEmails, newAccessLevel, comment)

	err = i.accessControl.ReloadUserRoles()
	if err != nil {
		return nil, err
	}

	return updatedUsers, nil
}

func (i *UserInteractor) Create(ctx context.Context, email string, accessLevel entity.AccessLevel, loggedUserID string) (*entity.User, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResUsers, auth.ActEdit); err != nil {
		return nil, err
	}

	_, err := i.userRepo.GetByEmail(email)
	if err == nil {
		return nil, fmt.Errorf("already exists an user with email: %s", email)
	}

	if err != ErrUserNotFound {
		return nil, err
	}

	createdUser, err := i.userRepo.Create(ctx, email, accessLevel)
	if err != nil {
		return nil, err
	}

	i.userActivityInteractor.RegisterCreateUser(loggedUserID, createdUser)

	err = i.accessControl.ReloadUserRoles()
	if err != nil {
		return nil, err
	}

	return createdUser, err
}

func (i *UserInteractor) RemoveUsers(ctx context.Context, userIDs []string, loggedUserID, comment string) ([]*entity.User, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResUsers, auth.ActEdit); err != nil {
		return nil, err
	}

	users, err := i.userRepo.MarkAsDeleted(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	deletedUserIDs := make([]string, len(users))
	deletedUserEmails := make([]string, len(users))
	for i, u := range users {
		deletedUserIDs[i] = u.ID
		deletedUserEmails[i] = u.Email
	}
	i.userActivityInteractor.RegisterRemoveUsers(loggedUserID, deletedUserIDs, deletedUserEmails, comment)

	err = i.sessionRepo.DeleteByUserIDs(deletedUserIDs)
	if err != nil {
		return nil, err
	}

	err = i.apiTokenRepo.DeleteByUserIDs(ctx, deletedUserIDs)
	if err != nil {
		return nil, err
	}

	err = i.accessControl.ReloadUserRoles()
	if err != nil {
		return nil, err
	}

	return users, nil
}

// DeleteAPIToken return the deleted APIToken
func (i *UserInteractor) DeleteAPIToken(ctx context.Context, tokenID, loggedUserID string) (*entity.APIToken, error) {
	i.logger.Info("Deleting API token.")

	apiToken, err := i.apiTokenRepo.GetByID(ctx, tokenID)
	if err != nil {
		return nil, fmt.Errorf("error getting api token: %w", err)
	}

	err = i.apiTokenRepo.DeleteById(ctx, tokenID)
	if err != nil {
		return nil, fmt.Errorf("error deleting api token: %w", err)
	}

	err = i.userActivityInteractor.RegisterDeleteAPIToken(loggedUserID, apiToken.Name)
	if err != nil {
		return nil, fmt.Errorf("error on register api token deletion: %w", err)
	}

	return apiToken, nil
}

// GenerateAPIToken create a new APIToken and return the internal token
func (i *UserInteractor) GenerateAPIToken(ctx context.Context, name, loggedUserID string) (string, error) {
	i.logger.Info("Generating API Token.")

	code, err := i.apiTokenRepo.GenerateCode(loggedUserID)
	if err != nil {
		return "", fmt.Errorf("error generating api token: %w", err)
	}

	apiToken := entity.APIToken{
		Name:   name,
		UserID: loggedUserID,
	}

	err = i.apiTokenRepo.Create(ctx, apiToken, code)
	if err != nil {
		return "", fmt.Errorf("error saving api token: %w", err)
	}

	err = i.userActivityInteractor.RegisterGenerateAPIToken(loggedUserID, name)
	if err != nil {
		return "", fmt.Errorf("error on register api token generation: %w", err)
	}

	return code, err
}
