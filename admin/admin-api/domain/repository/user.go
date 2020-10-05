package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
)

type UserRepo interface {
	// GetByEmail returns the user with the given email.
	GetByEmail(email string) (*entity.User, error)

	GetManyByEmail(ctx context.Context, email string) ([]*entity.User, error)

	// Create persists a new User into the database.
	Create(ctx context.Context, email string, accessLevel entity.AccessLevel) (*entity.User, error)

	GetByID(userID string) (*entity.User, error)

	GetByIDs(keys []string) ([]*entity.User, error)

	GetAll(ctx context.Context, returnDeleted bool) ([]*entity.User, error)

	UpdateAccessLevel(ctx context.Context, userIDs []string, accessLevel entity.AccessLevel) ([]*entity.User, error)

	MarkAsDeleted(ctx context.Context, userIDs []string) ([]*entity.User, error)

	UpdateLastActivity(userID string) error

	GetAPITokenByValue(ctx context.Context, userID, token string) (*entity.APIToken, error)

	GetAPITokenById(ctx context.Context, userID, tokenID string) (*entity.APIToken, error)

	DeleteAPIToken(ctx context.Context, userID, tokenID string) error

	SaveAPIToken(ctx context.Context, name, userID, token string) error

	UpdateAPITokenLastActivity(ctx context.Context, userID, token string) error
}
