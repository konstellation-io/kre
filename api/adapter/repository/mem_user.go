package repository

import (
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/domain/usecase/logging"
	"sync"
)

type MemUserRepo struct {
	cfg    *config.Config
	logger logging.Logger
	mu     *sync.Mutex
	users  map[string]*entity.User
}

func NewMemUserRepo(cfg *config.Config, logger logging.Logger) *MemUserRepo {
	return &MemUserRepo{
		cfg,
		logger,
		&sync.Mutex{},
		make(map[string]*entity.User),
	}
}

func (r *MemUserRepo) Save(user *entity.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.users[user.ID] = user
	return nil
}

func (r *MemUserRepo) GetByEmail(email string) (*entity.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, user := range r.users {
		if user.Email == email {
			return user, nil
		}
	}

	return nil, nil
}
