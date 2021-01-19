package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"context"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"time"
)

type MetricRepo interface {
	GetMetrics(
		ctx context.Context,
		startDate time.Time,
		endDate time.Time,
		versionID string,
	) ([]entity.ClassificationMetric, error)
}
