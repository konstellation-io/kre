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

// StartVersion creates resources in k8s
func (k *K8sVersionClient) Start(ctx context.Context, runtime *entity.Runtime, version *entity.Version) error {
	configVars := versionToConfig(version)
	wf := versionToWorkflows(version)
	totalMongoReplicas := 1

	req := versionpb.StartRequest{
		VersionId:      version.ID,
		VersionName:    version.Name,
		Config:         configVars,
		Workflows:      wf,
		MongoUri:       runtime.GetMongoURI(totalMongoReplicas),
		MongoDbName:    k.cfg.MongoDB.DBName,
		MongoKrtBucket: k.cfg.MongoDB.KRTBucket,
		InfluxUri:      runtime.GetInfluxURL(),
		Entrypoint: &versionpb.Entrypoint{
			ProtoFile: version.Entrypoint.ProtoFile,
			Image:     version.Entrypoint.Image,
		},
		K8SNamespace: runtime.GetNamespace(),
	}

	_, err := k.client.Start(ctx, &req)
	return err
}

func (k *K8sVersionClient) Stop(ctx context.Context, runtime *entity.Runtime, version *entity.Version) error {
	req := versionpb.VersionName{
		Name:         version.Name,
		K8SNamespace: runtime.GetNamespace(),
	}

	_, err := k.client.Stop(ctx, &req)
	if err != nil {
		return fmt.Errorf("stop version '%s' error: %w", version.Name, err)
	}

	return nil
}

func (k *K8sVersionClient) UpdateConfig(runtime *entity.Runtime, version *entity.Version) error {
	configVars := versionToConfig(version)

	req := versionpb.UpdateConfigRequest{
		VersionName:  version.Name,
		Config:       configVars,
		K8SNamespace: runtime.GetNamespace(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()

	_, err := k.client.UpdateConfig(ctx, &req)
	return err
}

func (k *K8sVersionClient) Unpublish(runtime *entity.Runtime, version *entity.Version) error {
	req := versionpb.VersionName{
		Name:         version.Name,
		K8SNamespace: runtime.GetNamespace(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	_, err := k.client.Unpublish(ctx, &req)
	return err
}

func (k *K8sVersionClient) Publish(runtime *entity.Runtime, version *entity.Version) error {
	req := versionpb.VersionName{
		Name:         version.Name,
		K8SNamespace: runtime.GetNamespace(),
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

func versionToWorkflows(version *entity.Version) []*versionpb.Workflow {
	wf := make([]*versionpb.Workflow, len(version.Workflows))

	for i, w := range version.Workflows {
		nodes := make([]*versionpb.Workflow_Node, len(w.Nodes))
		for j, n := range w.Nodes {
			nodes[j] = &versionpb.Workflow_Node{
				Id:    n.ID,
				Name:  n.Name,
				Image: n.Image,
				Src:   n.Src,
				Gpu:   n.GPU,
			}
		}
		edges := make([]*versionpb.Workflow_Edge, len(w.Edges))
		for k, e := range w.Edges {
			edges[k] = &versionpb.Workflow_Edge{
				Id:       e.ID,
				FromNode: e.FromNode,
				ToNode:   e.ToNode,
			}
		}

		wf[i] = &versionpb.Workflow{
			Id:         w.ID,
			Name:       w.Name,
			Entrypoint: w.Entrypoint,
			Nodes:      nodes,
			Edges:      edges,
		}
	}

	return wf
}

func (k *K8sVersionClient) WatchNodeStatus(ctx context.Context, versionName string) (<-chan *entity.Node, error) {
	stream, err := k.client.WatchNodeStatus(ctx, &versionpb.NodeStatusRequest{
		VersionName: versionName,
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
