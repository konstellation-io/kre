package repository

import (
	"errors"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"sync"
	"time"
)

var ErrTokenNotFound = errors.New("error token not found")

type MemTokenRepo struct {
	cfg    *config.Config
	logger logging.Logger
	mu     *sync.Mutex
	tokens map[string]entity.VerificationCode
}

func NewMemVerificationCodeRepo(cfg *config.Config, logger logging.Logger) *MemTokenRepo {
	return &MemTokenRepo{
		cfg,
		logger,
		&sync.Mutex{},
		make(map[string]entity.VerificationCode),
	}
}

func (r *MemTokenRepo) Store(code, uid string, ttl time.Duration) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.tokens[code] = entity.VerificationCode{
		Code:      code,
		UID:       uid,
		ExpiresAt: time.Now().Add(ttl),
	}

	return nil
}

func (r *MemTokenRepo) Get(code string) (*entity.VerificationCode, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	storedToken, ok := r.tokens[code]
	if !ok {
		return &storedToken, ErrTokenNotFound
	}

	return &storedToken, nil
}

func (r *MemTokenRepo) Delete(code string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.tokens, code)
	return nil
}
