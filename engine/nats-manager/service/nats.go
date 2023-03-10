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
func (n *NatsService) CreateStreams(_ context.Context, req *natspb.CreateStreamsRequest) (*natspb.MutationResponse, error) {
	n.logger.Info("CreateStreams request received")

	err := n.manager.CreateStreams(req.RuntimeId, req.VersionName, req.Workflows)
	if err != nil {
		n.logger.Errorf("Error creating streams: %s", err)
		return nil, err
	}
	return &natspb.MutationResponse{
		Message: fmt.Sprintf("Streams and subjects for version '%s' on runtime %s created", req.VersionName, req.RuntimeId),
	}, nil
}

// CreateObjectStore
func (n *NatsService) CreateObjectStore(_ context.Context, req *natspb.CreateStreamsRequest) (*natspb.MutationResponse, error) {
	n.logger.Info("CreateObjectStore request received")

	err := n.manager.CreateObjectStore(req.RuntimeId, req.VersionName, req.Workflows)
	if err != nil {
		n.logger.Errorf("Error creating object store: %s", err)
		return nil, err
	}
	return &natspb.MutationResponse{
		Message: fmt.Sprintf("Object stores for version '%s' on runtime %s created", req.VersionName, req.RuntimeId),
	}, nil
}

// DeleteStreams delete streams for given workflows
func (n *NatsService) DeleteStreams(_ context.Context, req *natspb.DeleteStreamsRequest) (*natspb.MutationResponse, error) {
	n.logger.Info("Stop request received")

	err := n.manager.DeleteStreams(req.RuntimeId, req.VersionName, req.Workflows)
	if err != nil {
		n.logger.Errorf("Error deleting streams: %s", err)
		return nil, err
	}

	return &natspb.MutationResponse{
		Message: fmt.Sprintf("Streams and subjects for version '%s' on runtime %s deleted", req.VersionName, req.RuntimeId),
	}, nil
}

// GetVersionNatsConfig returns nats configuration for given version, including subjects to subscribe for each node
func (n *NatsService) GetVersionNatsConfig(
	_ context.Context,
	req *natspb.GetVersionNatsConfigRequest,
) (*natspb.GetVersionNatsConfigResponse, error) {
	n.logger.Info("GetVersionNatsConfig request received")

	projectNatsConfig, err := n.manager.GetVersionNatsConfig(req.RuntimeId, req.VersionName, req.Workflows)
	if err != nil {
		n.logger.Errorf("Error getting nats configuration for version \"%s\": %s", req.VersionName, err)
		return nil, err
	}

	return &natspb.GetVersionNatsConfigResponse{
		ProjectConfig: projectNatsConfig,
	}, nil
}
