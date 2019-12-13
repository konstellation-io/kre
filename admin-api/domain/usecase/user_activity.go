package usecase

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type UserActivityType string

const (
	UserActivityTypeLogin         UserActivityType = "LOGIN"
	UserActivityTypeLogout        UserActivityType = "LOGOUT"
	UserActivityTypeCreateRuntime UserActivityType = "CREATE_RUNTIME"
)

type UserActivityInteractor struct {
	logger           logging.Logger
	userActivityRepo repository.UserActivityRepo
	userRepo         repository.UserRepo
}

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

func (i *UserActivityInteractor) Get(userEmail *string, activityType *string, fromDate *string, toDate *string, lastID *string) ([]entity.UserActivity, error) {
	return i.userActivityRepo.Get(userEmail, activityType, fromDate, toDate, lastID)
}

func (i *UserActivityInteractor) Create(
	userID string,
	userActivityType UserActivityType,
) error {
	user, err := i.userRepo.GetByID(userID)
	if err != nil {
		return err
	}

	userActivity := entity.UserActivity{
		ID:   primitive.NewObjectID().Hex(),
		User: *user,
		Type: string(userActivityType),
		Date: time.Now(),
	}

	return i.userActivityRepo.Create(userActivity)
}
