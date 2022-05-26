package repository

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

type APITokenRepo interface {
	GenerateCode(userID string) (string, error)
	Create(ctx context.Context, apiToken entity.APIToken, code string) error
	GetByID(ctx context.Context, id string) (*entity.APIToken, error)
	GetByUserID(ctx context.Context, userID string) ([]*entity.APIToken, error)
	GetByToken(ctx context.Context, token string) (*entity.APIToken, error)
	DeleteById(ctx context.Context, token string) error
	DeleteByUserIDs(ctx context.Context, userIDs []string) error
	UpdateLastActivity(ctx context.Context, id string) error
}
