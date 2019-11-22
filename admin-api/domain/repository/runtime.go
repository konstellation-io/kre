package repository

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

type RuntimeRepo interface {
	Create(name string, userID string) (*entity.Runtime, error)
	FindAll() ([]entity.Runtime, error)
}
