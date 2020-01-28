package service

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

type RuntimeService interface {
	StartVersion(runtime *entity.Runtime, version *entity.Version) error
	StopVersion(runtime *entity.Runtime, versionName string) error
	UnpublishVersion(runtime *entity.Runtime, versionName string) error
	PublishVersion(runtime *entity.Runtime, versionName string) error
	UpdateVersionConfig(runtime *entity.Runtime, version *entity.Version) error
	WatchNodeLogs(runtime *entity.Runtime, nodeID string, stopChannel <-chan bool) (<-chan *entity.NodeLog, error)
	WatchVersionStatus(runtime *entity.Runtime, versionName string, stopChannel <-chan bool) (<-chan *entity.VersionNodeStatus, error)
}
