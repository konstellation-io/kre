package service

import (
	"context"
	"errors"
	"fmt"

	"google.golang.org/grpc"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/service/proto/natspb"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type NatsManagerClient struct {
	cfg    *config.Config
	client natspb.NatsManagerServiceClient
	logger logging.Logger
}

func NewNatsManagerClient(cfg *config.Config, logger logging.Logger) (*NatsManagerClient, error) {
	cc, err := grpc.Dial(cfg.Services.NatsManager, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	client := natspb.NewNatsManagerServiceClient(cc)

	return &NatsManagerClient{
		cfg,
		client,
		logger,
	}, nil
}

// CreateStreams calls nats-manager to create NATS streams for given version
func (n *NatsManagerClient) CreateStreams(
	ctx context.Context,
	runtimeID string,
	version *entity.Version,
) (*entity.VersionStreamsConfig, error) {
	workflows, err := n.getWorkflowsFromVersion(version)
	if err != nil {
		return nil, err
	}

	req := natspb.CreateStreamsRequest{
		RuntimeId:   runtimeID,
		VersionName: version.Name,
		Workflows:   workflows,
	}

	res, err := n.client.CreateStreams(ctx, &req)
	if err != nil {
		return nil, fmt.Errorf("error creating streams: %w", err)
	}

	return n.dtoToVersionStreamConfig(res.Workflows), err
}

// CreateObjectStores calls nats-manager to create NATS Object Stores for given version
func (n *NatsManagerClient) CreateObjectStores(
	ctx context.Context,
	runtimeID string,
	version *entity.Version,
) (*entity.VersionObjectStoresConfig, error) {
	workflows, err := n.getWorkflowsFromVersion(version)
	if err != nil {
		return nil, err
	}

	req := natspb.CreateObjectStoresRequest{
		RuntimeId:   runtimeID,
		VersionName: version.Name,
		Workflows:   workflows,
	}

	res, err := n.client.CreateObjectStores(ctx, &req)
	if err != nil {
		return nil, fmt.Errorf("error creating object stores: %w", err)
	}

	return n.dtoToVersionObjectStoreConfig(res.Workflows), err
}

// DeleteStreams calls nats-manager to delete NATS streams for given version
func (n *NatsManagerClient) DeleteStreams(ctx context.Context, runtimeID string, versionName string) error {
	req := natspb.DeleteStreamsRequest{
		RuntimeId:   runtimeID,
		VersionName: versionName,
	}

	_, err := n.client.DeleteStreams(ctx, &req)
	if err != nil {
		return fmt.Errorf("error deleting version %q NATS streams: %w", versionName, err)
	}

	return nil
}

// DeleteObjectStores calls nats-manager to delete NATS Object Stores for given version
func (n *NatsManagerClient) DeleteObjectStores(ctx context.Context, runtimeID, versionName string) error {
	req := natspb.DeleteObjectStoresRequest{
		RuntimeId:   runtimeID,
		VersionName: versionName,
	}

	_, err := n.client.DeleteObjectStores(ctx, &req)
	if err != nil {
		return fmt.Errorf("error deleting version %q NATS object stores: %w", versionName, err)
	}

	return nil
}

func (n *NatsManagerClient) getWorkflowsFromVersion(version *entity.Version) ([]*natspb.Workflow, error) {
	var workflows []*natspb.Workflow
	for _, w := range version.Workflows {
		nodes := make([]*natspb.Node, 0, len(w.Nodes))

		for _, node := range w.Nodes {
			nodeToAppend := natspb.Node{
				Name:          node.Name,
				Subscriptions: node.Subscriptions,
			}
			if node.ObjectStore != nil {
				scope, err := translateObjectStoreEnum(node.ObjectStore.Scope)
				if err != nil {
					return nil, err
				}
				nodeToAppend.ObjectStore = &natspb.ObjectStore{
					Name:  node.ObjectStore.Name,
					Scope: scope,
				}
			}
			nodes = append(nodes, &nodeToAppend)
		}
		workflows = append(workflows, &natspb.Workflow{
			Entrypoint: w.Entrypoint,
			Name:       w.Name,
			Nodes:      nodes,
		})
	}
	return workflows, nil
}

func (n *NatsManagerClient) getWorkflowsEntrypoints(version *entity.Version) []string {
	workflowsEntrypoints := make([]string, 0, len(version.Workflows))
	for _, workflow := range version.Workflows {
		workflowsEntrypoints = append(workflowsEntrypoints, workflow.Entrypoint)
	}
	return workflowsEntrypoints
}

func (n *NatsManagerClient) dtoToVersionStreamConfig(
	workflows map[string]*natspb.CreateStreamsResponse_WorkflowStreamConfig,
) *entity.VersionStreamsConfig {

	workflowsConfig := map[string]*entity.WorkflowStreamConfig{}
	for workflow, streamCfg := range workflows {
		workflowsConfig[workflow] = &entity.WorkflowStreamConfig{
			Stream:            streamCfg.Stream,
			Nodes:             n.dtoToNodesStreamConfig(streamCfg.Nodes),
			EntrypointSubject: streamCfg.EntrypointSubject,
		}
	}

	return &entity.VersionStreamsConfig{
		Workflows: workflowsConfig,
	}
}

func (n *NatsManagerClient) dtoToNodesStreamConfig(
	nodes map[string]*natspb.CreateStreamsResponse_NodeStreamConfig,
) map[string]*entity.NodeStreamConfig {
	nodesStreamCfg := map[string]*entity.NodeStreamConfig{}

	for node, subjectCfg := range nodes {
		nodesStreamCfg[node] = &entity.NodeStreamConfig{
			Subject:       subjectCfg.Subject,
			Subscriptions: subjectCfg.Subscriptions,
		}
	}

	return nodesStreamCfg
}

func (n *NatsManagerClient) dtoToVersionObjectStoreConfig(
	workflows map[string]*natspb.CreateObjectStoresResponse_WorkflowObjectStoreConfig,
) *entity.VersionObjectStoresConfig {
	workflowsObjStoreConfig := entity.WorkflowsObjectStoresConfig{}

	for workflow, objStoreCfg := range workflows {
		workflowsObjStoreConfig[workflow] = objStoreCfg.Nodes
	}

	return &entity.VersionObjectStoresConfig{
		Workflows: workflowsObjStoreConfig,
	}
}

func translateObjectStoreEnum(scope string) (natspb.ObjectStoreScope, error) {
	switch scope {
	case "project":
		return natspb.ObjectStoreScope_SCOPE_PROJECT, nil
	case "workflow":
		return natspb.ObjectStoreScope_SCOPE_WORKFLOW, nil
	default:
		return natspb.ObjectStoreScope_SCOPE_WORKFLOW, errors.New("invalid object store scope")
	}
}
