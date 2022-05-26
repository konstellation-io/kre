package repository

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

type SessionRepo interface {
	Create(session entity.Session) error
	GetByToken(token string) (entity.Session, error)
	DeleteByToken(token string) error
	DeleteByUserIDs(userIDs []string) error
	GetUserSessions(ctx context.Context, userID string) ([]entity.Session, error)
}
