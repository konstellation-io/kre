package service

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

type RuntimeService interface {
	DeployVersion(runtime *entity.Runtime, version *entity.Version) error
	StopVersion(runtime *entity.Runtime, versionName string) error
	UpdateVersionConfig(runtime *entity.Runtime, version *entity.Version) error
	DeactivateVersion(runtime *entity.Runtime, versionName string) error
	ActivateVersion(runtime *entity.Runtime, versionName string) error
	WatchNodeLogs(runtime *entity.Runtime, nodeID string, stopChannel <-chan bool) (<-chan *entity.NodeLog, error)
}
