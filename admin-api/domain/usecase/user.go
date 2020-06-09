package usecase

import (
	"context"
	"errors"
	"fmt"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
)

// UserInteractor contains app logic to handle User entities
type UserInteractor struct {
	logger   logging.Logger
	userRepo repository.UserRepo
}

// NewUserInteractor creates a new UserInteractor
func NewUserInteractor(logger logging.Logger, userRepo repository.UserRepo) *UserInteractor {
	return &UserInteractor{
		logger,
		userRepo,
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

// GetAllUsers returns all existing Users
func (i *UserInteractor) GetAllUsers(ctx context.Context, returnDeleted bool) ([]*entity.User, error) {
	return i.userRepo.GetAll(ctx, returnDeleted)
}

func (i *UserInteractor) UpdateAccessLevel(ctx context.Context, userIDs []string, newAccessLevel entity.AccessLevel) ([]*entity.User, error) {
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

	return updatedUsers, nil
}

func (i *UserInteractor) Create(ctx context.Context, email string, accessLevel entity.AccessLevel) (*entity.User, error) {
	_, err := i.userRepo.GetByEmail(email)
	if err == nil {
		return nil, fmt.Errorf("already exists an user with email: %s", email)
	}

	if err != ErrUserNotFound {
		return nil, err
	}

	return i.userRepo.Create(ctx, email, accessLevel)
}

func (i *UserInteractor) RemoveUsers(ctx context.Context, userIDs []string) ([]*entity.User, error) {
	return i.userRepo.MarkAsDeleted(ctx, userIDs)
}
