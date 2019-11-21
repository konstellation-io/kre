package server

import (
	"context"
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-resource-manager/config"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-resource-manager/kubernetes"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-resource-manager/runtimepb"
)

// GrpcServer basic server
type GrpcServer struct {
	cfg       *config.Config
	resources *kubernetes.ResourceManager
}

func NewGrpcServer(
	cfg *config.Config,
	resource *kubernetes.ResourceManager,
) *GrpcServer {
	return &GrpcServer{
		cfg:       cfg,
		resources: resource,
	}
}

func (s *GrpcServer) NewRuntime(ctx context.Context, req *runtimepb.NewRuntimeRequest) (*runtimepb.NewRuntimeResponse, error) {
	runtimeName := strcase.ToKebab(req.GetRuntime().GetName())
	result := fmt.Sprintf("Runtime %s created", runtimeName)

	err := s.resources.CreateRuntime(runtimeName)
	if err != nil {
		if err == kubernetes.ErrRuntimeResourceCreation {
			result = err.Error()
		} else {
			result = kubernetes.ErrUnexpected.Error()
		}
	}

	// Send response
	res := &runtimepb.NewRuntimeResponse{
		Result: result,
	}

	return res, nil
}
