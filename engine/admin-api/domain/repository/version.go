package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type VersionRepo interface {
	Create(userID, productID string, version *entity.Version) (*entity.Version, error)
	CreateIndexes(ctx context.Context, productID string) error
	GetByID(productID, versionId string) (*entity.Version, error)
	GetByName(ctx context.Context, productID, name string) (*entity.Version, error)
	GetByProduct(productID string) ([]*entity.Version, error)
	Update(productID string, version *entity.Version) error
	SetHasDoc(ctx context.Context, productID, versionID string, hasDoc bool) error
	SetStatus(ctx context.Context, productID, versionID string, status entity.VersionStatus) error
	GetAll(productID string) ([]*entity.Version, error)
	SetErrors(ctx context.Context, productID string, version *entity.Version, errorMessages []string) (*entity.Version, error)
	UploadKRTFile(productID string, version *entity.Version, file string) error
	ClearPublishedVersion(ctx context.Context, productID string) (*entity.Version, error)
}
