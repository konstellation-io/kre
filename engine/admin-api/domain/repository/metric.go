package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"time"
)

type MetricRepo interface {
	GetMetrics(
		ctx context.Context,
		startDate time.Time,
		endDate time.Time,
		runtimeId string,
		versionName string,
	) ([]entity.ClassificationMetric, error)
	CreateIndexes(ctx context.Context, runtimeId string) error
}
