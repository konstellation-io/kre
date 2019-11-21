package server

import (
	"context"
	"fmt"

	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/config"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/kubernetes"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/runtimepb"
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

func (s *GrpcServer) CreateRuntime(ctx context.Context, req *runtimepb.CreateRuntimeRequest) (*runtimepb.CreateRuntimeResponse, error) {
	runtimeName := strcase.ToKebab(req.GetRuntime().GetName())
	message := fmt.Sprintf("Runtime %s created", runtimeName)
	success := true

	err := s.resources.CreateRuntime(runtimeName)
	if err != nil {
		success = false
		if err == kubernetes.ErrRuntimeResourceCreation {
			message = err.Error()
		} else {
			message = kubernetes.ErrUnexpected.Error()
		}
	}

	// Send response
	res := &runtimepb.CreateRuntimeResponse{
		Success: success,
		Message: message,
	}

	return res, nil
}
