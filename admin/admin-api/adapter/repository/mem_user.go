package repository

import (
	"sync"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
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

func (r *MemUserRepo) Create(email string) (*entity.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	user := &entity.User{
		ID:    email,
		Email: email,
	}

	r.users[user.ID] = user
	return user, nil
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
