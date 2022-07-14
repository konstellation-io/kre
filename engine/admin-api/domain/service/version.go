package service

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/service_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type VersionService interface {
	Start(context.Context, string, *entity.Version) error
	Stop(context.Context, string, *entity.Version) error
	Unpublish(string, *entity.Version) error
	Publish(string, *entity.Version) error
	UpdateConfig(string, *entity.Version) error
	WatchNodeStatus(ctx context.Context, runtimeId, versionName string) (<-chan *entity.Node, error)
}
