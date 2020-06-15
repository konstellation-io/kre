package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"github.com/konstellation-io/kre/admin-api/domain/entity"
)

type UserActivityRepo interface {
	Create(activity entity.UserActivity) error
	Get(userEmail *string, activityType *string, fromDate *string, toDate *string, lastID *string) ([]*entity.UserActivity, error)
}
