package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/runtimepb"
	"google.golang.org/grpc"
	"time"
)

type RuntimeAPIServiceGRPC struct {
	cfg    *config.Config
	logger logging.Logger
}

func NewRuntimeAPIServiceGRPC(cfg *config.Config, logger logging.Logger) *RuntimeAPIServiceGRPC {
	return &RuntimeAPIServiceGRPC{
		cfg,
		logger,
	}
}

// DeployVersion creates resources in k8s
func (k *RuntimeAPIServiceGRPC) DeployVersion(runtime *entity.Runtime, version *entity.Version) error {
	ns := strcase.ToKebab(runtime.Name)
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", ns), grpc.WithInsecure())

	if err != nil {
		return err
	}

	defer func() {
		err := cc.Close()
		if err != nil {
			k.logger.Error(err.Error())
		}
	}()

	c := runtimepb.NewRuntimeServiceClient(cc)

	wf := make([]*runtimepb.Workflow, len(version.Workflows))

	for i, w := range version.Workflows {
		nodes := make([]*runtimepb.Workflow_Node, len(w.Nodes))
		for j, n := range w.Nodes {
			nodes[j] = &runtimepb.Workflow_Node{
				Id:    n.ID,
				Name:  n.Name,
				Image: n.Image,
				Src:   n.Src,
			}
		}
		edges := make([]*runtimepb.Workflow_Edge, len(w.Edges))
		for k, e := range w.Edges {
			edges[k] = &runtimepb.Workflow_Edge{
				Id:       e.ID,
				FromNode: e.FromNode,
				ToNode:   e.ToNode,
			}
		}

		wf[i] = &runtimepb.Workflow{
			Name:       w.Name,
			Entrypoint: w.Entrypoint,
			Nodes:      nodes,
			Edges:      edges,
		}
	}

	req := runtimepb.DeployVersionRequest{
		Version: &runtimepb.Version{
			Name: version.Name,
			Entrypoint: &runtimepb.Entrypoint{
				ProtoFile: version.Entrypoint.ProtoFile,
				Image:     version.Entrypoint.Image,
				Src:       version.Entrypoint.Src,
			},
			Workflows: wf,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	res, err := c.DeployVersion(ctx, &req)
	if err != nil {
		return err
	}

	if !res.GetSuccess() {
		return errors.New(res.GetMessage())
	}

	return nil
}

func (k *RuntimeAPIServiceGRPC) ActivateVersion(runtime *entity.Runtime, versionName string) error {
	ns := strcase.ToKebab(runtime.Name)
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", ns), grpc.WithInsecure())
	if err != nil {
		return err
	}

	defer func() {
		err := cc.Close()
		if err != nil {
			k.logger.Error(err.Error())
		}
	}()

	c := runtimepb.NewRuntimeServiceClient(cc)

	req := runtimepb.ActivateVersionRequest{
		Version: &runtimepb.Version{
			Name: versionName,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	res, err := c.ActivateVersion(ctx, &req)
	if err != nil {
		return err
	}

	if !res.GetSuccess() {
		return errors.New(res.GetMessage())
	}

	return nil
}
