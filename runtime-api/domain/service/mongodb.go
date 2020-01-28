package service

import (
	"context"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
)

type LogStreamService interface {
	Connect(ctx context.Context)
	Disconnect()
	WatchNodeLogs(ctx context.Context, nodeId string, logsCh chan<- *entity.NodeLog)
}
