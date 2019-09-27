package repository

import (
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/domain/entity"
)

type UserRepo interface {
	// GetByEmail returns the user with the given email.
	GetByEmail(email string) (*entity.User, error)
}
