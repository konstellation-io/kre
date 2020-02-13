package usecase

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
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
func (i *UserInteractor) GetByIDs(userIDs []string) ([]*entity.User, []error) {
	return i.userRepo.GetByIDs(userIDs)
}

// GetAllUsers returns all existing Users
func (i *UserInteractor) GetAllUsers() ([]*entity.User, error) {
	return i.userRepo.GetAll()
}
