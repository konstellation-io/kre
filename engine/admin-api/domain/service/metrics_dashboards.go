package service

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/service_${GOFILE} -package=mocks

import (
	"context"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type DashboardService interface {
	Create(ctx context.Context, runtime *entity.Runtime, version, dashboardPath string) error
}
