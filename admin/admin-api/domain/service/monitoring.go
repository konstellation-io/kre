package service

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/service_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
)

type MonitoringService interface {
	NodeLogs(ctx context.Context, runtime *entity.Runtime, versionID string, filters entity.LogFilters) (<-chan *entity.NodeLog, error)
	WatchNodeStatus(ctx context.Context, runtime *entity.Runtime, versionName string) (<-chan *entity.Node, error)
	SearchLogs(ctx context.Context, runtime *entity.Runtime, versionID string, filters entity.LogFilters, cursor *string) (entity.SearchLogsResult, error)
	GetMetrics(ctx context.Context, runtime *entity.Runtime, versionID string, startDate string, endDate string) ([]entity.MetricRow, error)
}
