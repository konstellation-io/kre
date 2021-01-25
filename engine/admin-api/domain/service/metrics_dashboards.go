package service

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/service_${GOFILE} -package=mocks

import (
	"context"
)

type DashboardService interface {
	Create(ctx context.Context, version, dashboardPath string) error
}
