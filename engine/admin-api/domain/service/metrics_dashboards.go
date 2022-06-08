package service

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/service_${GOFILE} -package=mocks

import (
	"context"
)

type DashboardService interface {
	Create(ctx context.Context, runtimeId, version, dashboardPath string) error
}
