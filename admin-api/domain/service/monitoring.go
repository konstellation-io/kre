package service

import "gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"

// TODO: Change stop channel to derived context
type MonitoringService interface {
	NodeLogs(runtime *entity.Runtime, nodeID string, stopCh <-chan bool) (<-chan *entity.NodeLog, error)
	VersionStatus(runtime *entity.Runtime, versionName string, stopCh <-chan bool) (<-chan *entity.VersionNodeStatus, error)
}
