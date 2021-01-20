package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type RuntimeRepo interface {
	Create(ctx context.Context, runtime *entity.Runtime) (*entity.Runtime, error)
	UpdateStatus(ctx context.Context, runtimeID string, newStatus entity.RuntimeStatus) error
	FindAll(ctx context.Context) ([]*entity.Runtime, error)
	GetByID(ctx context.Context, runtimeID string) (*entity.Runtime, error)
	GetByName(ctx context.Context, name string) (*entity.Runtime, error)
	UpdatePublishedVersion(ctx context.Context, runtimeID string, versionID string) error
}
