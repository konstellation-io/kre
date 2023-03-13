package service

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/service_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type NatsManagerService interface {
	CreateStreams(ctx context.Context, runtimeID string, version *entity.Version) (*entity.VersionStreamsConfig, error)
	CreateObjectStores(ctx context.Context, runtimeID string, version *entity.Version) (*entity.VersionObjectStoresConfig, error)
	DeleteStreams(ctx context.Context, runtimeID string, version *entity.Version) error
}
