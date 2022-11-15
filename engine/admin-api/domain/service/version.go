package service

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/service_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type VersionService interface {
	Start(ctx context.Context, runtimeID string, version *entity.Version, versionStreamConfig entity.VersionStreamConfig) error
	Stop(ctx context.Context, runtimeID string, version *entity.Version) error
	Unpublish(runtimeID string, version *entity.Version) error
	Publish(runtimeID string, version *entity.Version) error
	UpdateConfig(runtimeID string, version *entity.Version) error
	WatchNodeStatus(ctx context.Context, runtimeId, versionName string) (<-chan *entity.Node, error)
}
