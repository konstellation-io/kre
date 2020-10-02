package service

import (
	"context"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
)

type DashboardService interface {
	Create(ctx context.Context, runtime *entity.Runtime, version string) error
}
