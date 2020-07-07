package service

import (
	"context"
	"fmt"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"github.com/konstellation-io/kre/k8s-manager/config"
	"github.com/konstellation-io/kre/k8s-manager/entity"
	"github.com/konstellation-io/kre/k8s-manager/kubernetes/version"
	"github.com/konstellation-io/kre/k8s-manager/proto/versionpb"
)

// VersionService basic server
type VersionService struct {
	config  *config.Config
	logger  *simplelogger.SimpleLogger
	manager *version.Manager
}

// NewVersionService instantiates the GRPC server implementation.
func NewVersionService(
	config *config.Config,
	logger *simplelogger.SimpleLogger,
	manager *version.Manager,
) *VersionService {
	return &VersionService{
		config,
		logger,
		manager,
	}
}

// Start starts a version on Kubernetes.
func (v *VersionService) Start(_ context.Context, req *versionpb.Request) (*versionpb.Response, error) {
	fmt.Println("Start request received")

	err := v.manager.Start(&entity.Version{Version: *req.GetVersion()})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version '%s' started", req.GetVersion().GetName()),
	}, nil
}

func (v *VersionService) UpdateConfig(ctx context.Context, req *versionpb.Request) (*versionpb.Response, error) {
	v.logger.Info("UpdateConfig request received")

	err := v.manager.UpdateConfig(ctx, &entity.Version{Version: *req.GetVersion()})
	if err != nil {
		v.logger.Errorf("error updating config: %s", err.Error())
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version '%s' config updated", req.GetVersion().GetName()),
	}, nil
}

func (v *VersionService) Stop(ctx context.Context, req *versionpb.Request) (*versionpb.Response, error) {
	fmt.Println("Stop request received")

	reqVersion := req.GetVersion()

	err := v.manager.Stop(ctx, &entity.Version{Version: *reqVersion})
	if err != nil {
		v.logger.Errorf("Error stopping version: %s", err.Error())
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version '%s' stopped", reqVersion.GetName()),
	}, nil
}

func (v *VersionService) Publish(_ context.Context, req *versionpb.Request) (*versionpb.Response, error) {
	fmt.Println("Publish request received")

	ver := &entity.Version{Version: *req.GetVersion()}

	err := v.manager.Publish(ver)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version  '%s' published correctly. in namespace '%s'", ver.GetName(), ver.Namespace),
	}, nil
}

func (v *VersionService) Unpublish(_ context.Context, req *versionpb.Request) (*versionpb.Response, error) {
	fmt.Println("Unpublish request received")

	err := v.manager.Unpublish(&entity.Version{Version: *req.GetVersion()})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version '%s' unpublished", req.GetVersion().GetName()),
	}, nil
}
