package repository

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"time"
)

type VerificationCodeRepo interface {
	// Store securely stores the given token with the given expiry time.
	Store(code, uid string, ttl time.Duration) error

	// Get returns the stored code if exists, in other case returns an error.
	Get(code string) (*entity.VerificationCode, error)

	// Delete removes the stored code.
	Delete(code string) error
}
