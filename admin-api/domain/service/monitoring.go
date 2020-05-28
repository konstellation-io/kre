package service

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/service_${GOFILE} -package=mocks

import (
	"context"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
)

// TODO: Change stop channel to derived context
type MonitoringService interface {
	NodeLogs(runtime *entity.Runtime, versionID string, filters entity.LogFilters, stopCh <-chan bool) (<-chan *entity.NodeLog, error)
	VersionStatus(runtime *entity.Runtime, versionName string, stopCh <-chan bool) (<-chan *entity.VersionNodeStatus, error)
	SearchLogs(ctx context.Context, runtime *entity.Runtime, versionID string, filters entity.LogFilters, cursor *string) (entity.SearchLogsResult, error)
	GetMetrics(ctx context.Context, runtime *entity.Runtime, versionID string, startDate string, endDate string) ([]entity.MetricRow, error)
}
