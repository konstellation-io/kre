package repository

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
)

type VersionRepo interface {
	Create(userID, runtimeID, name, description string) (*entity.Version, error)
}
