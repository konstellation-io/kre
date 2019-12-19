package server

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/input"
	"log"

	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/config"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/k8smanagerpb"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/kubernetes"
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

func (s *GrpcServer) CreateRuntime(ctx context.Context, req *k8smanagerpb.CreateRuntimeRequest) (*k8smanagerpb.CreateRuntimeResponse, error) {
	runtime := req.GetRuntime()
	success := true

	runtimeInput := &input.CreateRuntimeInput{
		Name: strcase.ToKebab(runtime.GetName()),
		Minio: input.MinioConfig{
			AccessKey: runtime.Minio.GetAccessKey(),
			SecretKey: runtime.Minio.GetSecretKey(),
		},
	}
	message := fmt.Sprintf("Runtime %s created", runtimeInput.Name)

	err := s.resources.CreateRuntime(runtimeInput)
	if err != nil {
		success = false
		if err == kubernetes.ErrRuntimeResourceCreation {
			message = err.Error()
		} else {
			message = kubernetes.ErrUnexpected.Error()
		}
	}

	// Send response
	res := &k8smanagerpb.CreateRuntimeResponse{
		Success: success,
		Message: message,
	}

	return res, nil
}

func (s *GrpcServer) CheckRuntimeIsCreated(ctx context.Context, req *k8smanagerpb.CheckRuntimeIsCreatedRequest) (*k8smanagerpb.CheckRuntimeIsCreatedResponse, error) {
	runtimeName := req.GetName()
	runtimeNamespace := strcase.ToKebab(runtimeName)
	log.Printf("Checking if runtime \"%s\" pods are created in namespace \"%s\"...\n", runtimeName, runtimeNamespace)

	err := s.resources.WaitForPods(runtimeNamespace)
	if err != nil {
		return &k8smanagerpb.CheckRuntimeIsCreatedResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &k8smanagerpb.CheckRuntimeIsCreatedResponse{
		Success: true,
		Message: "Runtime created correctly.",
	}, nil
}
