package service

import "gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"

type ResourceManagerService interface {
	CreateEntrypoint(version *entity.Version) error
	CreateNode(version *entity.Version, node *entity.Node, versionConfig string) error
	CreateVersionConfig(version *entity.Version) (string, error)
	StopVersion(name string) error
	DeactivateVersion(name string) error
	ActivateVersion(name string) error
	UpdateVersionConfig(version *entity.Version) error
}
