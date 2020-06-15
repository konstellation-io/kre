package service

import (
	"context"

	"github.com/konstellation-io/kre/admin-api/domain/entity"
)

type ResourceMetricsService interface {
	Get(ctx context.Context, runtimeName, versionName, fromDate, toDate string, step int32) ([]*entity.ResourceMetrics, error)
	Watch(ctx context.Context, runtimeName, versionName, fromDate string, step int32) (<-chan []*entity.ResourceMetrics, error)
}
