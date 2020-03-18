package service

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/service_${GOFILE} -package=mocks

import "gitlab.com/konstellation/kre/admin-api/domain/entity"

type RuntimeService interface {
	Create(runtime *entity.Runtime) (string, error)
	WaitForRuntimeStarted(runtime *entity.Runtime) (*entity.RuntimeStatus, error)
}
