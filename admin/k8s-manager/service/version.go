package service

import (
	"context"
	"fmt"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"github.com/konstellation-io/kre/admin/k8s-manager/config"
	"github.com/konstellation-io/kre/admin/k8s-manager/kubernetes/version"
	"github.com/konstellation-io/kre/admin/k8s-manager/proto/versionpb"
)

// VersionService basic server.
type VersionService struct {
	config  *config.Config
	logger  *simplelogger.SimpleLogger
	manager *version.Manager
}

// NewVersionService instantiates the GRPC server implementation.
func NewVersionService(
	cfg *config.Config,
	logger *simplelogger.SimpleLogger,
	manager *version.Manager,
) *VersionService {
	return &VersionService{
		cfg,
		logger,
		manager,
	}
}

// Start starts a version on Kubernetes.
func (v *VersionService) Start(ctx context.Context, req *versionpb.StartRequest) (*versionpb.Response, error) {
	fmt.Println("Start request received")

	err := v.manager.Start(req)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	err = v.manager.WaitForVersionPods(ctx, req.VersionName, req.K8SNamespace, req.Workflows)
	if err != nil {
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version '%s' started", req.VersionName),
	}, nil
}

func (v *VersionService) UpdateConfig(ctx context.Context, req *versionpb.UpdateConfigRequest) (*versionpb.Response, error) {
	v.logger.Info("UpdateConfig request received")

	err := v.manager.UpdateConfig(ctx, req)
	if err != nil {
		v.logger.Errorf("error updating config: %s", err.Error())
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version '%s' config updated", req.GetVersionName()),
	}, nil
}

func (v *VersionService) Stop(ctx context.Context, req *versionpb.VersionName) (*versionpb.Response, error) {
	fmt.Println("Stop request received")

	err := v.manager.Stop(ctx, req)
	if err != nil {
		v.logger.Errorf("Error stopping version: %s", err.Error())
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version '%s' stopped", req.GetName()),
	}, nil
}

func (v *VersionService) Publish(_ context.Context, req *versionpb.VersionName) (*versionpb.Response, error) {
	fmt.Println("Publish request received")

	err := v.manager.Publish(req)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version  '%s' published correctly. in namespace '%s'", req.GetName(), req.GetK8SNamespace()),
	}, nil
}

func (v *VersionService) Unpublish(_ context.Context, req *versionpb.VersionName) (*versionpb.Response, error) {
	fmt.Println("Unpublish request received")

	err := v.manager.Unpublish(req)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version '%s' unpublished", req.GetName()),
	}, nil
}
