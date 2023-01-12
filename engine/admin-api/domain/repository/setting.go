package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type SettingRepo interface {
	Get(ctx context.Context) (*entity.Settings, error)
	Create(entity.Settings) error
	Update(setting *entity.Settings) error
}
