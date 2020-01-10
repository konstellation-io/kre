package service

import "gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"

type ResourceManagerService interface {
	CreateEntrypoint(version *entity.Version) error
	CreateNode(version *entity.Version, node *entity.Node) error
	StopVersion(name string) error
	ActivateVersion(name string) error
}
