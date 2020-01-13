package repository

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
)

type VersionRepo interface {
	Create(userID string, version *entity.Version) (*entity.Version, error)
	GetByID(id string) (*entity.Version, error)
	Update(version *entity.Version) error
	GetByRuntime(runtimeID string) ([]entity.Version, error)
}
