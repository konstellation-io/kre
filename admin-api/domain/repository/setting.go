package repository

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

type SettingRepo interface {
	Get() (*entity.Setting, error)
	Create(entity.Setting) error
	Update(setting *entity.Setting) error
}
