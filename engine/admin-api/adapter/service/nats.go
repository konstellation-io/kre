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
func (n *NatsManagerClient) CreateStreams(ctx context.Context, runtimeID string, version *entity.Version) error {
	workflows, err := n.getWorkflowsFromVersion(version)
	if err != nil {
		return err
	}

	req := natspb.CreateStreamsRequest{
		RuntimeId:   runtimeID,
		VersionName: version.Name,
		Workflows:   workflows,
	}

	_, err = n.client.CreateStreams(ctx, &req)
	if err != nil {
		return fmt.Errorf("error creating streams: %w", err)
	}

	return err
}

// CreateObjectStores calls nats-manager to create NATS Object Stores for given version
func (n *NatsManagerClient) CreateObjectStores(ctx context.Context, runtimeID string, version *entity.Version) error {
	workflows, err := n.getWorkflowsFromVersion(version)
	if err != nil {
		return err
	}

	req := natspb.CreateStreamsRequest{
		RuntimeId:   runtimeID,
		VersionName: version.Name,
		Workflows:   workflows,
	}

	_, err = n.client.CreateObjectStore(ctx, &req)
	if err != nil {
		return fmt.Errorf("error creating objects stores: %w", err)
	}

	return err
}

// CreateKeyValueStores calls nats-manager to create NATS Key-Value Stores for given version
func (n *NatsManagerClient) CreateKeyValueStores(ctx context.Context, runtimeID string, version *entity.Version) error {
	workflows, err := n.getWorkflowsFromVersion(version)
	if err != nil {
		return err
	}

	req := natspb.CreateStreamsRequest{
		RuntimeId:   runtimeID,
		VersionName: version.Name,
		Workflows:   workflows,
	}

	_, err = n.client.CreateKeyValueStores(ctx, &req)
	if err != nil {
		return fmt.Errorf("error creating key-value stores: %w", err)
	}

	return err
}

// DeleteStreams calls nats-manager to delete NATS streams for given version
func (n *NatsManagerClient) DeleteStreams(ctx context.Context, runtimeID string, version *entity.Version) error {
	req := natspb.DeleteStreamsRequest{
		RuntimeId:   runtimeID,
		VersionName: version.Name,
		Workflows:   n.getWorkflowsEntrypoints(version),
	}

	_, err := n.client.DeleteStreams(ctx, &req)
	if err != nil {
		return fmt.Errorf("error deleting version '%s' NATS streams: %w", version.Name, err)
	}

	return nil
}

// GetVersionNatsConfig calls nats-manager to retrieve NATS streams configuration for given version
func (n *NatsManagerClient) GetVersionNatsConfig(
	ctx context.Context,
	runtimeID string,
	version *entity.Version,
) (entity.VersionStreamConfig, error) {
	workflows, err := n.getWorkflowsFromVersion(version)
	if err != nil {
		return entity.VersionStreamConfig{}, err
	}

	req := natspb.GetVersionNatsConfigRequest{
		RuntimeId:   runtimeID,
		VersionName: version.Name,
		Workflows:   workflows,
	}

	res, err := n.client.GetVersionNatsConfig(ctx, &req)
	if err != nil {
		return entity.VersionStreamConfig{}, fmt.Errorf("error getting NATS streams configuration for version '%s': %w", version.Name, err)
	}

	workflowNatsConfigs := make(map[string]entity.WorkflowStreamConfig, len(res.ProjectConfig.Workflows))
	for workflowName, workflowInfo := range res.ProjectConfig.Workflows {
		nodesNatsConfig := make(map[string]entity.NodeStreamConfig, len(workflowInfo.Nodes))
		for nodeName, nodeInfo := range workflowInfo.Nodes {
			nodesNatsConfig[nodeName] = entity.NodeStreamConfig{
				Subject:       nodeInfo.Subject,
				Subscriptions: nodeInfo.Subscriptions,
				ObjectStore:   nodeInfo.ObjectStore,
				KeyValueStore: nodeInfo.KeyValueStore,
			}
		}
		workflowNatsConfigs[workflowName] = entity.WorkflowStreamConfig{
			Stream:        workflowInfo.Stream,
			KeyValueStore: workflowInfo.KeyValueStore,
			Nodes:         nodesNatsConfig,
		}
	}

	versionNatsConfig := entity.VersionStreamConfig{
		KeyValueStore: res.ProjectConfig.KeyValueStore,
		Workflows:     workflowNatsConfigs,
	}

	return versionNatsConfig, nil
}

func (n *NatsManagerClient) getWorkflowsFromVersion(version *entity.Version) ([]*natspb.Workflow, error) {
	var workflows []*natspb.Workflow
	for _, w := range version.Workflows {
		nodes := []*natspb.Node{
			{
				Name:          "entrypoint",
				Subscriptions: []string{w.Exitpoint},
			},
		}
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
				nodeToAppend.ObjectStore = &natspb.Node_ObjectStore{
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

func translateObjectStoreEnum(scope string) (natspb.Node_ObjectStoreScope, error) {
	switch scope {
	case "project":
		return natspb.Node_SCOPE_PROJECT, nil
	case "workflow":
		return natspb.Node_SCOPE_WORKFLOW, nil
	default:
		return natspb.Node_SCOPE_WORKFLOW, errors.New("invalid object store scope")
	}
}
