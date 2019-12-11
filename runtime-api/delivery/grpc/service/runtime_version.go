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

	message := fmt.Sprintf("Runtime %s created", runtimeName)
	success := true

	_, err := s.interactor.CreateRuntimeVersion(runtimeName)
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
