package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"context"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
)

type UserRepo interface {
	// GetByEmail returns the user with the given email.
	GetByEmail(email string) (*entity.User, error)

	// Create persists a new User into the database.
	Create(ctx context.Context, email string, accessLevel entity.AccessLevel) (*entity.User, error)

	GetByID(userID string) (*entity.User, error)

	GetByIDs(keys []string) ([]*entity.User, error)

	GetAll() ([]*entity.User, error)

	UpdateAccessLevel(ctx context.Context, userIDs []string, accessLevel entity.AccessLevel) ([]*entity.User, error)
}
