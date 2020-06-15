package service

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/service_${GOFILE} -package=mocks

import "github.com/konstellation-io/kre/admin-api/domain/entity"

type RuntimeService interface {
	Create(runtime *entity.Runtime) (string, error)
	WaitForRuntimeStarted(runtime *entity.Runtime) (*entity.RuntimeStatus, error)
}
