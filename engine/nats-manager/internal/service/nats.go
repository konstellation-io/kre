package service

import (
	"context"
	"fmt"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/logger"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/config"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/entity"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/manager"
	"github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"
)

// NatsService basic server.
type NatsService struct {
	config  *config.Config
	logger  logging.Logger
	manager *manager.NatsManager
	natspb.UnimplementedNatsManagerServiceServer
}

// NewNatsService instantiates the GRPC server implementation.
func NewNatsService(
	cfg *config.Config,
	logger logging.Logger,
	manager *manager.NatsManager,
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

	objectStores, err := n.manager.CreateObjectStores(req.RuntimeId, req.VersionName, n.dtoToWorkflows(req.Workflows))
	if err != nil {
		n.logger.Errorf("Error creating object store: %s", err)
		return nil, err
	}
	return &natspb.CreateObjectStoreResponse{
		Workflows: n.workflowsObjStoreToDto(objectStores),
	}, nil
}

func (n *NatsService) CreateKeyValueStores(
	_ context.Context,
	req *natspb.CreationRequest,
) (*natspb.CreateKeyValueStoreResponse, error) {
	n.logger.Info("CreateKeyValueStores request received")

	keyValueStores, err := n.manager.CreateKeyValueStores(req.RuntimeId, req.VersionName, n.dtoToWorkflows(req.Workflows))
	if err != nil {
		n.logger.Errorf("Error creating object store: %s", err)
		return nil, err
	}
	return n.keyValueStoresToDto(keyValueStores), nil
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

func (n *NatsService) dtoToWorkflows(dtoWorkflows []*natspb.Workflow) []*entity.Workflow {
	workflows := make([]*entity.Workflow, 0, len(dtoWorkflows))

	for _, dtoWorkflow := range dtoWorkflows {
		workflows = append(workflows, &entity.Workflow{
			Name:       dtoWorkflow.Name,
			Entrypoint: dtoWorkflow.Entrypoint,
			Nodes:      n.dtoToNodes(dtoWorkflow.Nodes),
		})
	}

	return workflows
}

func (n *NatsService) dtoToNodes(dtoNodes []*natspb.Node) []*entity.Node {
	nodes := make([]*entity.Node, 0, len(dtoNodes))

	for _, dtoNode := range dtoNodes {
		node := &entity.Node{
			Name:          dtoNode.Name,
			Subscriptions: dtoNode.Subscriptions,
		}

		if dtoNode.ObjectStore != nil {
			node.ObjectStore = &entity.ObjectStore{
				Name:  dtoNode.ObjectStore.Name,
				Scope: entity.StoreScope(dtoNode.ObjectStore.Scope),
			}
		}
		nodes = append(nodes, node)
	}

	return nodes
}

func (n *NatsService) workflowsStreamConfigToDto(
	workflows entity.WorkflowsStreamsConfig,
) map[string]*natspb.CreateStreamResponse_WorkflowStreamConfig {
	workflowsStreamCfg := map[string]*natspb.CreateStreamResponse_WorkflowStreamConfig{}

	for workflow, cfg := range workflows {
		workflowsStreamCfg[workflow] = &natspb.CreateStreamResponse_WorkflowStreamConfig{
			Stream:            cfg.Stream,
			Nodes:             n.nodesStreamConfigToDto(cfg.Nodes),
			EntrypointSubject: cfg.EntrypointSubject,
		}
	}

	return workflowsStreamCfg
}

func (n *NatsService) nodesStreamConfigToDto(
	nodes entity.NodesStreamConfig,
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

func (n *NatsService) workflowsObjStoreToDto(
	workflowsObjStores entity.WorkflowsObjectStoresConfig,
) map[string]*natspb.CreateObjectStoreResponse_WorkflowObjectStoreConfig {
	workflowsConfig := map[string]*natspb.CreateObjectStoreResponse_WorkflowObjectStoreConfig{}

	for workflow, objectStoresConfig := range workflowsObjStores {
		workflowsConfig[workflow] = &natspb.CreateObjectStoreResponse_WorkflowObjectStoreConfig{
			Nodes: objectStoresConfig.Nodes,
		}
	}

	return workflowsConfig
}

func (n *NatsService) keyValueStoresToDto(stores *entity.VersionKeyValueStores) *natspb.CreateKeyValueStoreResponse {
	workflowsStores := map[string]*natspb.CreateKeyValueStoreResponse_WorkflowKeyValueStoreConfig{}

	for workflow, storesConfig := range stores.WorkflowsStores {
		workflowsStores[workflow] = &natspb.CreateKeyValueStoreResponse_WorkflowKeyValueStoreConfig{
			KeyValueStore: storesConfig.WorkflowStore,
			Nodes:         storesConfig.Nodes,
		}
	}

	return &natspb.CreateKeyValueStoreResponse{
		KeyValueStore: stores.ProjectStore,
		Workflows:     workflowsStores,
	}
}