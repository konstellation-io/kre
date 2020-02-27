package repository

import (
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
)

type UserActivityRepo interface {
	Create(activity entity.UserActivity) error
	Get(userEmail *string, activityType *string, fromDate *string, toDate *string, lastID *string) ([]*entity.UserActivity, error)
}
