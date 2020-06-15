package service

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"

	"github.com/konstellation-io/kre/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin-api/adapter/service/proto/versionpb"
	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
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
func (k *K8sVersionClient) Start(runtime *entity.Runtime, version *entity.Version) error {
	wf := make([]*versionpb.Version_Workflow, len(version.Workflows))

	for i, w := range version.Workflows {
		nodes := make([]*versionpb.Version_Workflow_Node, len(w.Nodes))
		for j, n := range w.Nodes {
			nodes[j] = &versionpb.Version_Workflow_Node{
				Id:    n.ID,
				Name:  n.Name,
				Image: n.Image,
				Src:   n.Src,
			}
		}
		edges := make([]*versionpb.Version_Workflow_Edge, len(w.Edges))
		for k, e := range w.Edges {
			edges[k] = &versionpb.Version_Workflow_Edge{
				Id:       e.ID,
				FromNode: e.FromNode,
				ToNode:   e.ToNode,
			}
		}

		wf[i] = &versionpb.Version_Workflow{
			Id:         w.ID,
			Name:       w.Name,
			Entrypoint: w.Entrypoint,
			Nodes:      nodes,
			Edges:      edges,
		}
	}

	configVars := make([]*versionpb.Version_Config, len(version.Config.Vars))
	for i, c := range version.Config.Vars {
		configVars[i] = &versionpb.Version_Config{
			Key:   c.Key,
			Value: c.Value,
		}
	}

	req := versionpb.Request{
		Version: &versionpb.Version{
			Id:        version.ID,
			Name:      version.Name,
			Namespace: runtime.GetNamespace(),
			Config:    configVars,
			Entrypoint: &versionpb.Version_Entrypoint{
				ProtoFile: version.Entrypoint.ProtoFile,
				Image:     version.Entrypoint.Image,
				Src:       version.Entrypoint.Src,
			},
			Workflows: wf,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := k.client.Start(ctx, &req)
	if err != nil {
		return err
	}

	return nil
}

func (k *K8sVersionClient) Stop(runtime *entity.Runtime, version *entity.Version) error {
	req := versionpb.Request{
		Version: &versionpb.Version{
			Name:      version.Name,
			Namespace: runtime.GetNamespace(),
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_, err := k.client.Stop(ctx, &req)
	if err != nil {
		return fmt.Errorf("stop version '%s' error: %w", version.Name, err)
	}

	return nil
}

func (k *K8sVersionClient) UpdateConfig(runtime *entity.Runtime, version *entity.Version) error {
	configVars := make([]*versionpb.Version_Config, len(version.Config.Vars))
	for x, c := range version.Config.Vars {
		configVars[x] = &versionpb.Version_Config{
			Key:   c.Key,
			Value: c.Value,
		}
	}

	req := versionpb.Request{
		Version: &versionpb.Version{
			Name:      version.Name,
			Namespace: runtime.GetNamespace(),
			Config:    configVars,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()

	_, err := k.client.UpdateConfig(ctx, &req)
	if err != nil {
		return err
	}

	return nil
}

func (k *K8sVersionClient) Unpublish(runtime *entity.Runtime, version *entity.Version) error {
	req := versionpb.Request{
		Version: &versionpb.Version{
			Name:      version.Name,
			Namespace: runtime.GetNamespace(),
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	_, err := k.client.Unpublish(ctx, &req)
	if err != nil {
		return err
	}

	return nil
}

func (k *K8sVersionClient) Publish(runtime *entity.Runtime, version *entity.Version) error {

	req := versionpb.Request{
		Version: &versionpb.Version{
			Name:      version.Name,
			Namespace: runtime.GetNamespace(),
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	_, err := k.client.Publish(ctx, &req)
	if err != nil {
		return err
	}

	return nil
}
