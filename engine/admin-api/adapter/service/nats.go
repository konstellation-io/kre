package service

import (
	"context"
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
	client := natspb.NewNatsManagerServiceClient(cc)
	if err != nil {
		return nil, err
	}

	return &NatsManagerClient{
		cfg,
		client,
		logger,
	}, nil
}

// CreateStreams calls nats-manager to create NATS streams for given version
func (n *NatsManagerClient) CreateStreams(ctx context.Context, runtimeID string, version *entity.Version) (entity.WorkflowsStreams, error) {
	req := natspb.CreateStreamsRequest{
		RuntimeId:   runtimeID,
		VersionName: version.Name,
		Workflows:   n.getWorkflowsFromVersion(version),
	}

	res, err := n.client.CreateStreams(ctx, &req)
	if err != nil {
		return nil, fmt.Errorf("error creating streams: %w", err)
	}

	workflowsStreams := make(entity.WorkflowsStreams, len(res.WorkflowsStreams))
	fmt.Println("STREAMS CREATED")
	for workflow, streamInfo := range res.WorkflowsStreams {
		fmt.Println("stream: " + streamInfo.Stream)
		fmt.Printf("nodes: %+v\n", streamInfo.NodesSubjects)
		workflowsStreams[workflow] = &entity.StreamInfo{
			Stream:        streamInfo.Stream,
			NodesSubjects: streamInfo.NodesSubjects,
		}
	}
	return workflowsStreams, err
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

func (n *NatsManagerClient) getWorkflowsFromVersion(version *entity.Version) []*natspb.Workflow {
	var workflows []*natspb.Workflow
	for _, w := range version.Workflows {
		var nodes []string
		for _, node := range w.Nodes {
			nodes = append(nodes, node.Name)
		}
		workflows = append(workflows, &natspb.Workflow{
			Entrypoint: w.Entrypoint,
			Name:       w.Name,
			Nodes:      nodes,
		})
	}
	return workflows
}

func (n *NatsManagerClient) getWorkflowsEntrypoints(version *entity.Version) []string {
	workflowsEntrypoints := make([]string, 0, len(version.Workflows))
	for _, workflow := range version.Workflows {
		workflowsEntrypoints = append(workflowsEntrypoints, workflow.Entrypoint)
	}
	return workflowsEntrypoints
}
