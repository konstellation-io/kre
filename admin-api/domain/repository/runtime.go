package repository

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

type RuntimeRepo interface {
	Create(*entity.Runtime) (*entity.Runtime, error)
	Update(*entity.Runtime) error
	FindAll() ([]entity.Runtime, error)
	GetByID(runtimeID string) (*entity.Runtime, error)
}
