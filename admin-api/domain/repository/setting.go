package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import "github.com/konstellation-io/kre/admin-api/domain/entity"

type SettingRepo interface {
	Get() (*entity.Setting, error)
	Create(entity.Setting) error
	Update(setting *entity.Setting) error
}
