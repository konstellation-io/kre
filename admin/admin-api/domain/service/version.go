package service

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/service_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
)

type VersionService interface {
	Start(context.Context, *entity.Runtime, *entity.Version) error
	Stop(context.Context, *entity.Runtime, *entity.Version) error
	Unpublish(*entity.Runtime, *entity.Version) error
	Publish(*entity.Runtime, *entity.Version) error
	UpdateConfig(*entity.Runtime, *entity.Version) error
}
