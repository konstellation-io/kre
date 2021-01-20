package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"context"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type NodeLogRepository interface {
	WatchNodeLogs(ctx context.Context, versionID string, filters entity.LogFilters) (<-chan *entity.NodeLog, error)
	PaginatedSearch(ctx context.Context, searchOpts *entity.SearchLogsOptions) (*entity.SearchLogsResult, error)
}
