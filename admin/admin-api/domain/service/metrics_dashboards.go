package service

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/service_${GOFILE} -package=mocks

import (
	"context"
	"os"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
)

type DashboardService interface {
	Create(ctx context.Context, runtime *entity.Runtime, version string, data *os.File) error
}
