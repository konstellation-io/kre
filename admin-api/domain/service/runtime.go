package service

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

type RuntimeService interface {
	Create(runtime *entity.Runtime) (string, error)
	WaitForRuntimeStarted(runtime *entity.Runtime) (*entity.RuntimeStatus, error)
}
