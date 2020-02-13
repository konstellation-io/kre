package repository

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
)

type UserActivityRepo interface {
	Create(activity entity.UserActivity) error
	Get(userEmail *string, activityType *string, fromDate *string, toDate *string, lastID *string) ([]*entity.UserActivity, error)
}
