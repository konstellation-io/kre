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

// CreateStreams create streams for given workflows.
func (n *NatsService) CreateStreams(
	_ context.Context,
	req *natspb.CreationRequest,
) (*natspb.CreateStreamResponse, error) {
	n.logger.Info("CreateStreams request received")

	workflows := n.dtoToWorkflows(req.Workflows)

	streamConfig, err := n.manager.CreateStreams(req.RuntimeId, req.VersionName, workflows)
	if err != nil {
		n.logger.Errorf("Error creating streams: %s", err)
		return nil, err
	}

	return &natspb.CreateStreamResponse{
		Workflows: n.workflowsStreamConfigToDto(streamConfig),
	}, nil
}

// CreateObjectStores creates object stores for given workflows.
func (n *NatsService) CreateObjectStores(
	_ context.Context,
	req *natspb.CreationRequest,
) (*natspb.CreateObjectStoreResponse, error) {
	n.logger.Info("CreateObjectStores request received")

	err := n.manager.CreateObjectStore(req.RuntimeId, req.VersionName, n.dtoToWorkflows(req.Workflows))
	if err != nil {
		n.logger.Errorf("Error creating object store: %s", err)
		return nil, err
	}
	return &natspb.CreateObjectStoreResponse{
		Workflows: nil,
	}, nil
}

// DeleteStreams delete streams for given workflows.
func (n *NatsService) DeleteStreams(
	_ context.Context,
	req *natspb.DeleteStreamsRequest,
) (*natspb.DeleteResponse, error) {
	n.logger.Info("Stop request received")

	err := n.manager.DeleteStreams(req.RuntimeId, req.VersionName, req.Workflows)
	if err != nil {
		n.logger.Errorf("Error deleting streams: %s", err)
		return nil, err
	}

	return &natspb.DeleteResponse{
		Message: fmt.Sprintf("Streams and subjects for version '%s' on runtime %s deleted", req.VersionName, req.RuntimeId),
	}, nil
}

//
//// GetVersionNatsConfig returns nats configuration for given version, including subjects to subscribe for each node
//func (n *NatsService) GetVersionNatsConfig(
//	_ context.Context,
//	req *natspb.GetVersionNatsConfigRequest,
//) (*natspb.GetVersionNatsConfigResponse, error) {
//	n.logger.Info("GetVersionNatsConfig request received")
//
//	workflowNatsConfig, err := n.manager.GetVersionNatsConfig(req.RuntimeId, req.VersionName, req.Workflows)
//	if err != nil {
//		n.logger.Errorf("Error getting nats configuration for version \"%s\": %s", req.VersionName, err)
//		return nil, err
//	}
//
//	return &natspb.GetVersionNatsConfigResponse{
//		Workflows: workflowNatsConfig,
//	}, nil
//}

func (n *NatsService) dtoToWorkflows(dtoWorkflows []*natspb.Workflow) []*manager.Workflow {
	workflows := make([]*manager.Workflow, 0, len(dtoWorkflows))

	for _, dtoWorkflow := range dtoWorkflows {
		workflows = append(workflows, &manager.Workflow{
			Name:       dtoWorkflow.Name,
			Entrypoint: dtoWorkflow.Entrypoint,
			Nodes:      n.dtoToNodes(dtoWorkflow.Nodes),
		})
	}

	return workflows
}

func (n *NatsService) dtoToNodes(dtoNodes []*natspb.Node) []*manager.Node {
	nodes := make([]*manager.Node, 0, len(dtoNodes))

	for _, dtoNode := range dtoNodes {
		nodes = append(nodes, &manager.Node{
			Name:          dtoNode.Name,
			Subscriptions: dtoNode.Subscriptions,
			ObjectStore: &manager.ObjectStore{
				Name:  dtoNode.ObjectStore.Name,
				Scope: manager.ObjectStoreScope(dtoNode.ObjectStore.Scope),
			},
		})
	}

	return nodes
}

func (n *NatsService) workflowsStreamConfigToDto(
	workflows manager.WorkflowsStreamsConfig,
) map[string]*natspb.CreateStreamResponse_WorkflowStreamConfig {
	workflowsStreamCfg := map[string]*natspb.CreateStreamResponse_WorkflowStreamConfig{}

	for workflow, cfg := range workflows {
		workflowsStreamCfg[workflow] = &natspb.CreateStreamResponse_WorkflowStreamConfig{
			Stream: cfg.Stream,
			Nodes:  n.nodesStreamConfigToDto(cfg.Nodes),
		}
	}

	return workflowsStreamCfg
}

func (n *NatsService) nodesStreamConfigToDto(
	nodes manager.NodesStreamConfig,
) map[string]*natspb.CreateStreamResponse_NodeStreamConfig {
	nodesStreamCfg := map[string]*natspb.CreateStreamResponse_NodeStreamConfig{}

	for node, cfg := range nodes {
		nodesStreamCfg[node] = &natspb.CreateStreamResponse_NodeStreamConfig{
			Subject:       cfg.Subject,
			Subscriptions: cfg.Subscriptions,
		}
	}

	return nodesStreamCfg
}
