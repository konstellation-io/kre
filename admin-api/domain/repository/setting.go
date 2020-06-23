package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import "github.com/konstellation-io/kre/admin-api/domain/entity"

type SettingRepo interface {
	Get() (*entity.Settings, error)
	Create(entity.Settings) error
	Update(setting *entity.Settings) error
}
