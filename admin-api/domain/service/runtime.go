package service

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

type RuntimeService interface {
	DeployVersion(runtime *entity.Runtime, versionName string) error
	ActivateVersion(runtime *entity.Runtime, versionName string) error
}
