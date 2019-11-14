package repository

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
)

type UserRepo interface {
	// GetByEmail returns the user with the given email.
	GetByEmail(email string) (*entity.User, error)
}
