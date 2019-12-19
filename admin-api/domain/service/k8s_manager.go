package service

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

type K8sManagerService interface {
	CreateRuntime(runtime *entity.Runtime) (string, error)
	CheckRuntimeIsCreated(name string) error
}
