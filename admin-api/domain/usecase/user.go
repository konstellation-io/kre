package usecase

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

type UserInteractor struct {
	logger   logging.Logger
	userRepo repository.UserRepo
}

func NewUserInteractor(logger logging.Logger, userRepo repository.UserRepo) *UserInteractor {
	return &UserInteractor{
		logger,
		userRepo,
	}
}

func (i *UserInteractor) GetByID(userID string) (*entity.User, error) {
	return i.userRepo.GetByID(userID)
}

func (i *UserInteractor) GetAllUsers() ([]entity.User, error) {
	return i.userRepo.GetAll()
}
