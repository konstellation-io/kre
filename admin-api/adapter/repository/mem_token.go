package repository

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"sync"
	"time"
)

type MemTokenRepo struct {
	cfg    *config.Config
	logger logging.Logger
	mu     *sync.Mutex
	tokens map[string]entity.Token
}

func NewMemTokenRepo(cfg *config.Config, logger logging.Logger) *MemTokenRepo {
	return &MemTokenRepo{
		cfg,
		logger,
		&sync.Mutex{},
		make(map[string]entity.Token),
	}
}

func (r *MemTokenRepo) Store(token, uid string, ttl time.Duration) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.tokens[token] = entity.Token{
		Code:      token,
		UID:       uid,
		ExpiresAt: time.Now().Add(ttl),
	}

	return nil
}
