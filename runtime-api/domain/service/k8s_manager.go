package service

import "gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"

type ResourceManagerService interface {
	CreateEntrypoint(version *entity.Version) error
	CreateNode(version *entity.Version, node *entity.Node) error
	CreateVersionConfig(version *entity.Version) (string, error)
	PublishVersion(name string) error
	UnpublishVersion(name string) error
	StopVersion(name string) error
	UpdateVersionConfig(version *entity.Version) error
	WatchVersionNodeStatus(versionName string, statusCh chan<- *entity.VersionNodeStatus) chan struct{}
}
