package service

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/kre/libs/simplelogger"

	"gitlab.com/konstellation/kre/k8s-manager/config"
	"gitlab.com/konstellation/kre/k8s-manager/entity"
	"gitlab.com/konstellation/kre/k8s-manager/kubernetes/version"
	"gitlab.com/konstellation/kre/k8s-manager/proto/versionpb"
)

// VersionService basic server
type VersionService struct {
	config  *config.Config
	logger  *simplelogger.SimpleLogger
	manager *version.Manager
}

// NewVersionService instantiates the GRPC server implementation
func NewVersionService(config *config.Config, logger *simplelogger.SimpleLogger, manager *version.Manager) *VersionService {
	return &VersionService{
		config,
		logger,
		manager,
	}
}

// Start starts a version on Kubernetes
func (v *VersionService) Start(ctx context.Context, req *versionpb.Request) (*versionpb.Response, error) {
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

// UpdateConfig changes the config on the specified version
func (v *VersionService) UpdateConfig(ctx context.Context, req *versionpb.Request) (*versionpb.Response, error) {
	fmt.Println("UpdateConfig request received")

	err := v.manager.UpdateConfig(&entity.Version{Version: *req.GetVersion()})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return &versionpb.Response{
		Message: fmt.Sprintf("Version '%s' config updated", req.GetVersion().GetName()),
	}, nil
}

// Stop remove all resources for the given version
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

// Publish associates a service with for the given version
func (v *VersionService) Publish(ctx context.Context, req *versionpb.Request) (*versionpb.Response, error) {
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

func (v *VersionService) Unpublish(ctx context.Context, req *versionpb.Request) (*versionpb.Response, error) {
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
