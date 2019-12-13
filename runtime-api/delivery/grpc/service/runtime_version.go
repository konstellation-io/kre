package service

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/runtimepb"
)

// RuntimeVersionService basic server
type RuntimeVersionService struct {
	cfg        *config.Config
	logger     logging.Logger
	interactor *usecase.RuntimeVersionInteractor
}

func NewRuntimeVersionService(
	cfg *config.Config,
	logger logging.Logger,
	interactor *usecase.RuntimeVersionInteractor,

) *RuntimeVersionService {
	return &RuntimeVersionService{
		cfg:        cfg,
		logger:     logger,
		interactor: interactor,
	}
}

func (s *RuntimeVersionService) CreateRuntimeVersion(ctx context.Context, req *runtimepb.CreateRuntimeVersionRequest) (*runtimepb.CreateRuntimeVersionResponse, error) {
	s.logger.Info("CreateRuntimeVersionRequest received")
	runtimeName := req.GetRuntimeVersion().GetName()
	runtimeID := req.GetRuntimeVersion().GetId()

	message := fmt.Sprintf("Runtime %s created", runtimeName)
	success := true

	_, err := s.interactor.CreateRuntimeVersion(runtimeID, runtimeName)
	if err != nil {
		success = false
		message = err.Error()
	}

	// Send response
	res := &runtimepb.CreateRuntimeVersionResponse{
		Success: success,
		Message: message,
	}

	return res, nil
}

func (s *RuntimeVersionService) CheckRuntimeVersionIsCreated(ctx context.Context, req *runtimepb.CheckRuntimeVersionIsCreatedRequest) (*runtimepb.CheckRuntimeVersionIsCreatedResponse, error) {
	runtimeID := req.GetId()
	runtimeName := req.GetName()
	namespace := s.cfg.Kubernetes.Namespace
	s.logger.Info(fmt.Sprintf("Checking if runtime-version \"%s\" pods are created in namespace \"%s\"...\n", runtimeName, namespace))

	err := s.interactor.CheckRuntimeVersionIsCreated(runtimeID, runtimeName)
	if err != nil {
		return &runtimepb.CheckRuntimeVersionIsCreatedResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &runtimepb.CheckRuntimeVersionIsCreatedResponse{
		Success: true,
		Message: "Runtime Version created correctly.",
	}, nil
}
