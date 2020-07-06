package service

import (
	"context"
	"fmt"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"github.com/konstellation-io/kre/runtime/k8s-manager/config"
	"github.com/konstellation-io/kre/runtime/k8s-manager/entity"
	"github.com/konstellation-io/kre/runtime/k8s-manager/kubernetes"
	"github.com/konstellation-io/kre/runtime/k8s-manager/kubernetes/runtime"
	"github.com/konstellation-io/kre/runtime/k8s-manager/proto/runtimepb"
)

// RuntimeService basic server
type RuntimeService struct {
	config  *config.Config
	logger  *simplelogger.SimpleLogger
	manager *runtime.Manager
	watcher *kubernetes.Watcher
}

func NewRuntimeService(
	config *config.Config,
	logger *simplelogger.SimpleLogger,
	manager *runtime.Manager,
	watcher *kubernetes.Watcher,
) *RuntimeService {
	return &RuntimeService{
		config,
		logger,
		manager,
		watcher,
	}
}

// Create creates a new Runtime object.
func (s *RuntimeService) Create(_ context.Context, req *runtimepb.Request) (*runtimepb.Response, error) {
	r := req.GetRuntime()

	err := s.manager.Create(&entity.Runtime{Runtime: *r})
	if err != nil {
		return nil, err
	}

	return &runtimepb.Response{
		Message: fmt.Sprintf("Runtime '%s' created", r.GetName()),
	}, nil
}

// RuntimeStatus check K8s waiting for all the Runtime components to be on running state.
func (s *RuntimeService) RuntimeStatus(
	_ context.Context,
	req *runtimepb.Request,
) (*runtimepb.RuntimeStatusResponse, error) {
	ns := req.GetRuntime().GetNamespace()

	fmt.Printf("Checking if runtime '%s' pods are created.\n", ns)

	err := s.watcher.WaitForPods(ns)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return &runtimepb.RuntimeStatusResponse{
		Status: "STARTED",
	}, nil
}
