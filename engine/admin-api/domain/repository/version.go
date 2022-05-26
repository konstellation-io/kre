package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type VersionRepo interface {
	Create(userID string, version *entity.Version) (*entity.Version, error)
	GetByID(id string) (*entity.Version, error)
	GetByName(ctx context.Context, runtimeId, name string) (*entity.Version, error)
	GetByIDs(ids []string) ([]*entity.Version, []error)
	GetByRuntime(runtimeID string) ([]*entity.Version, error)
	Update(version *entity.Version) error
	SetHasDoc(ctx context.Context, versionID string, hasDoc bool) error
	SetStatus(ctx context.Context, versionID string, status entity.VersionStatus) error
	GetAll() ([]*entity.Version, error)
	SetErrors(ctx context.Context, version *entity.Version, errorMessages []string) (*entity.Version, error)
	UploadKRTFile(version *entity.Version, file string) error
	ClearPublishedVersion(ctx context.Context) (*entity.Version, error)
}
