package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type VersionRepo interface {
	Create(userID, runtimeId string, version *entity.Version) (*entity.Version, error)
	CreateIndexes(ctx context.Context, runtimeId string) error
	GetByID(runtimeId, versionId string) (*entity.Version, error)
	GetByName(ctx context.Context, runtimeId, name string) (*entity.Version, error)
	GetByRuntime(runtimeId string) ([]*entity.Version, error)
	Update(runtimeId string, version *entity.Version) error
	SetHasDoc(ctx context.Context, runtimeId, versionID string, hasDoc bool) error
	SetStatus(ctx context.Context, runtimeId, versionID string, status entity.VersionStatus) error
	GetAll(runtimeId string) ([]*entity.Version, error)
	SetErrors(ctx context.Context, runtimeId string, version *entity.Version, errorMessages []string) (*entity.Version, error)
	UploadKRTFile(runtimeId string, version *entity.Version, file string) error
	ClearPublishedVersion(ctx context.Context, runtimeId string) (*entity.Version, error)
}
