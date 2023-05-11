package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type VersionRepo interface {
	Create(userID, runtimeID string, version *entity.Version) (*entity.Version, error)
	CreateIndexes(ctx context.Context, runtimeID string) error
	GetByID(runtimeID, versionID string) (*entity.Version, error)
	GetByName(ctx context.Context, runtimeID, name string) (*entity.Version, error)
	GetByRuntime(runtimeID string) ([]*entity.Version, error)
	Update(runtimeID string, version *entity.Version) error
	SetHasDoc(ctx context.Context, runtimeID, versionID string, hasDoc bool) error
	SetStatus(ctx context.Context, runtimeID, versionID string, status entity.VersionStatus) error
	GetAll(runtimeID string) ([]*entity.Version, error)
	SetErrors(ctx context.Context, runtimeID string, version *entity.Version, errorMessages []string) (*entity.Version, error)
	UploadKRTFile(runtimeID string, version *entity.Version, file string) error
	ClearPublishedVersion(ctx context.Context, runtimeID string) (*entity.Version, error)
}
