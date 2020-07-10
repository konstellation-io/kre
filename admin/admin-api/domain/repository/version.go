package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"context"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
)

type VersionRepo interface {
	Create(userID string, version *entity.Version) (*entity.Version, error)
	GetByID(id string) (*entity.Version, error)
	GetByIDs(ids []string) ([]*entity.Version, []error)
	Update(version *entity.Version) error
	UpdateHasDoc(ctx context.Context, versionID string, hasDoc bool) error
	GetByRuntime(runtimeID string) ([]*entity.Version, error)
}
