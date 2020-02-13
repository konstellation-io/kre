package service

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

type VersionService interface {
	Start(runtime *entity.Runtime, version *entity.Version) error
	Stop(runtime *entity.Runtime, version *entity.Version) error
	Unpublish(runtime *entity.Runtime, version *entity.Version) error
	Publish(runtime *entity.Runtime, version *entity.Version) error
	UpdateConfig(runtime *entity.Runtime, version *entity.Version) error
}
