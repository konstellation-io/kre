package usecase

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

// UserActivityType enumerate all possible types
type UserActivityType string

const (
	// UserActivityTypeLogin type
	UserActivityTypeLogin UserActivityType = "LOGIN"
	// UserActivityTypeLogout type
	UserActivityTypeLogout UserActivityType = "LOGOUT"
	// UserActivityTypeCreateRuntime type
	UserActivityTypeCreateRuntime UserActivityType = "CREATE_RUNTIME"
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
func (i *UserActivityInteractor) Get(userEmail *string, activityType *string, fromDate *string, toDate *string, lastID *string) ([]entity.UserActivity, error) {
	return i.userActivityRepo.Get(userEmail, activityType, fromDate, toDate, lastID)
}

// Create add a new UserActivity to the given user
func (i *UserActivityInteractor) Create(userID string, userActivityType UserActivityType) error {
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
