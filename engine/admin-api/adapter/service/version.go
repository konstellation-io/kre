package service

import (
	"context"
	"fmt"
	"io"
	"time"

	"google.golang.org/grpc"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/service/proto/versionpb"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type K8sVersionClient struct {
	cfg    *config.Config
	client versionpb.VersionServiceClient
	logger logging.Logger
}

func NewK8sVersionClient(cfg *config.Config, logger logging.Logger) (*K8sVersionClient, error) {
	cc, err := grpc.Dial(cfg.Services.K8sManager, grpc.WithInsecure())
	client := versionpb.NewVersionServiceClient(cc)
	if err != nil {
		return nil, err
	}

	return &K8sVersionClient{
		cfg,
		client,
		logger,
	}, nil
}

// Start creates the version resources in k8s
func (k *K8sVersionClient) Start(
	ctx context.Context,
	runtimeID string,
	version *entity.Version,
	versionConfig *entity.VersionConfig,
) error {
	configVars := versionToConfig(version)
	wf, err := versionToWorkflows(version, versionConfig)
	if err != nil {
		return err
	}

	req := versionpb.StartRequest{
		RuntimeId:      runtimeID,
		VersionId:      version.ID,
		VersionName:    version.Name,
		Config:         configVars,
		Workflows:      wf,
		MongoUri:       k.cfg.MongoDB.Address,
		MongoDbName:    k.cfg.MongoDB.DBName,
		MongoKrtBucket: k.cfg.MongoDB.KRTBucket,
		InfluxUri:      fmt.Sprintf("http://%s-influxdb:8086", k.cfg.ReleaseName),
		Entrypoint: &versionpb.Entrypoint{
			ProtoFile: version.Entrypoint.ProtoFile,
			Image:     version.Entrypoint.Image,
		},
	}

	_, err = k.client.Start(ctx, &req)
	return err
}

func (k *K8sVersionClient) Stop(ctx context.Context, runtimeID string, version *entity.Version) error {
	workflowEntrypoints := make([]string, 0)
	for _, w := range version.Workflows {
		workflowEntrypoints = append(workflowEntrypoints, w.Entrypoint)
	}
	req := versionpb.VersionInfo{
		Name:      version.Name,
		RuntimeId: runtimeID,
		Workflows: workflowEntrypoints,
	}

	_, err := k.client.Stop(ctx, &req)
	if err != nil {
		return fmt.Errorf("stop version '%s' error: %w", version.Name, err)
	}

	return nil
}

func (k *K8sVersionClient) UpdateConfig(runtimeID string, version *entity.Version) error {
	configVars := versionToConfig(version)

	req := versionpb.UpdateConfigRequest{
		RuntimeId:   runtimeID,
		VersionName: version.Name,
		Config:      configVars,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()

	_, err := k.client.UpdateConfig(ctx, &req)
	return err
}

func (k *K8sVersionClient) Unpublish(runtimeID string, version *entity.Version) error {
	req := versionpb.VersionInfo{
		Name:      version.Name,
		RuntimeId: runtimeID,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	_, err := k.client.Unpublish(ctx, &req)
	return err
}

func (k *K8sVersionClient) Publish(runtimeID string, version *entity.Version) error {
	req := versionpb.VersionInfo{
		Name:      version.Name,
		RuntimeId: runtimeID,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	_, err := k.client.Publish(ctx, &req)
	return err
}

func versionToConfig(version *entity.Version) []*versionpb.Config {
	configVars := make([]*versionpb.Config, len(version.Config.Vars))

	for i, c := range version.Config.Vars {
		configVars[i] = &versionpb.Config{
			Key:   c.Key,
			Value: c.Value,
		}
	}

	return configVars
}

func versionToWorkflows(version *entity.Version, versionConfig *entity.VersionConfig) ([]*versionpb.Workflow, error) {
	wf := make([]*versionpb.Workflow, len(version.Workflows))

	for i, w := range version.Workflows {
		workflowStreamConfig, err := versionConfig.GetWorkflowStreamConfig(w.Name)
		if err != nil {
			return nil, fmt.Errorf("error translating version in workflow \"%s\": %w", w.Name, err)
		}

		nodes := make([]*versionpb.Workflow_Node, len(w.Nodes))
		for j, n := range w.Nodes {

			nodeStreamCfg, err := workflowStreamConfig.GetNodeStreamConfig(n.Name)
			if err != nil {
				return nil, fmt.Errorf("error translating version in workflow \"%s\": %w", w.Name, err)
			}

			nodes[j] = &versionpb.Workflow_Node{
				Id:            n.ID,
				Name:          n.Name,
				Image:         n.Image,
				Src:           n.Src,
				Gpu:           n.GPU,
				Subscriptions: nodeStreamCfg.Subscriptions,
				Subject:       nodeStreamCfg.Subject,
				ObjectStore:   versionConfig.GetNodeObjectStoreConfig(w.Name, n.Name),
				Replicas:      n.Replicas,
			}
		}

		wf[i] = &versionpb.Workflow{
			Id:   w.ID,
			Name: w.Name,
			Entrypoint: &versionpb.Workflow_Entrypoint{
				Name:    w.Entrypoint,
				Subject: workflowStreamConfig.EntrypointSubject,
			},
			Nodes:     nodes,
			Exitpoint: w.Exitpoint,
			Stream:    workflowStreamConfig.Stream,
		}
	}

	return wf, nil
}

func (k *K8sVersionClient) WatchNodeStatus(ctx context.Context, runtimeID, versionName string) (<-chan *entity.Node, error) {
	stream, err := k.client.WatchNodeStatus(ctx, &versionpb.NodeStatusRequest{
		VersionName: versionName,
		RuntimeId:   runtimeID,
	})
	if err != nil {
		return nil, fmt.Errorf("version status opening stream: %w", err)
	}

	ch := make(chan *entity.Node, 1)

	go func() {
		defer close(ch)

		for {
			k.logger.Debug("[VersionService.WatchNodeStatus] waiting for stream.Recv()...")
			msg, err := stream.Recv()

			if stream.Context().Err() == context.Canceled {
				k.logger.Debug("[VersionService.WatchNodeStatus] Context canceled.")
				return
			}

			if err == io.EOF {
				k.logger.Debug("[VersionService.WatchNodeStatus] EOF msg received.")
				return
			}

			if err != nil {
				k.logger.Errorf("[VersionService.WatchNodeStatus] Unexpected error: %s", err)
				return
			}

			k.logger.Debug("[VersionService.WatchNodeStatus] Message received")

			status := entity.NodeStatus(msg.GetStatus())
			if !status.IsValid() {
				k.logger.Errorf("[VersionService.WatchNodeStatus] Invalid node status: %s", status)
				continue
			}

			ch <- &entity.Node{
				ID:     msg.GetNodeId(),
				Name:   msg.GetName(),
				Status: status,
			}
		}
	}()

	return ch, nil
}
