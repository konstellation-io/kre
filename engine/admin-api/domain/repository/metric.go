package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"
	"time"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type MetricRepo interface {
	GetMetrics(
		ctx context.Context,
		startDate time.Time,
		endDate time.Time,
		runtimeID string,
		versionName string,
	) ([]entity.ClassificationMetric, error)
	CreateIndexes(ctx context.Context, runtimeID string) error
}
