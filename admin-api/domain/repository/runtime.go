package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"context"
	"github.com/konstellation-io/kre/admin-api/domain/entity"
)

type RuntimeRepo interface {
	Create(ctx context.Context, runtime *entity.Runtime) (*entity.Runtime, error)
	UpdateStatus(ctx context.Context, runtimeID string, newStatus entity.RuntimeStatus) error
	FindAll(ctx context.Context) ([]*entity.Runtime, error)
	GetByID(ctx context.Context, runtimeID string) (*entity.Runtime, error)
}
