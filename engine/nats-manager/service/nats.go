package service

import (
	"context"
	"fmt"
	"github.com/konstellation-io/kre/engine/nats-manager/config"
	logging "github.com/konstellation-io/kre/engine/nats-manager/logger"
	"github.com/konstellation-io/kre/engine/nats-manager/manager"
	"github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"
)

// NatsService basic server.
type NatsService struct {
	config  *config.Config
	logger  logging.Logger
	manager manager.Manager
	natspb.UnimplementedNatsManagerServiceServer
}

// NewNatsService instantiates the GRPC server implementation.
func NewNatsService(
	cfg *config.Config,
	logger logging.Logger,
	manager manager.Manager,
) *NatsService {
	return &NatsService{
		cfg,
		logger,
		manager,
		natspb.UnimplementedNatsManagerServiceServer{},
	}
}

// CreateStreams create streams for given workflows
func (n *NatsService) CreateStreams(_ context.Context, req *natspb.CreateStreamsRequest) (*natspb.CreateStreamsResponse, error) {
	n.logger.Info("Start request received")

	workflowsStreams, err := n.manager.CreateStreams(req.RuntimeId, req.VersionName, req.Workflows)
	if err != nil {
		n.logger.Errorf("error creating streams: %w", err)
		return nil, err
	}
	return &natspb.CreateStreamsResponse{
		Message:          fmt.Sprintf("Streams and subjects for version '%s' on runtime %s created", req.VersionName, req.RuntimeId),
		WorkflowsStreams: workflowsStreams,
	}, nil
}

// DeleteStreams delete streams for given workflows
func (n *NatsService) DeleteStreams(_ context.Context, req *natspb.DeleteStreamsRequest) (*natspb.DeleteStreamsResponse, error) {
	n.logger.Info("Stop request received")

	err := n.manager.DeleteStreams(req.RuntimeId, req.VersionName, req.Workflows)
	if err != nil {
		n.logger.Errorf("error deleting streams: %w", err)
		return nil, err
	}

	return &natspb.DeleteStreamsResponse{
		Message: fmt.Sprintf("Streams and subjects for version '%s' on runtime %s deleted", req.VersionName, req.RuntimeId),
	}, nil
}
