package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"time"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type VerificationCodeRepo interface {
	// Store securely stores the given token with the given expiry time.
	Store(code, uid string, ttl time.Duration) error

	// Get returns the stored code if exists, in other case returns an error.
	Get(code string) (*entity.VerificationCode, error)

	// Delete removes the stored code.
	Delete(code string) error
}
