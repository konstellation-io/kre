package service

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/service_${GOFILE} -package=mocks

import (
	"context"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
)

type RuntimeService interface {
	Create(ctx context.Context, runtime *entity.Runtime) (string, error)
	WaitForRuntimeStarted(ctx context.Context, runtime *entity.Runtime) (*entity.RuntimeStatusEntity, error)
}
