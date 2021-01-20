package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type RuntimeRepo interface {
	Create(ctx context.Context, runtime *entity.Runtime) (*entity.Runtime, error)
	Get(ctx context.Context) (*entity.Runtime, error)
	GetByName(ctx context.Context, name string) (*entity.Runtime, error)
}
