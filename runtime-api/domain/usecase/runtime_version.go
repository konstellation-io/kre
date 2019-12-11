package usecase

import (
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
)

type RuntimeVersionStatus string

var (
	RuntimeVersionStatusCreating RuntimeVersionStatus = "CREATING"
	RuntimeVersionStatusRunning  RuntimeVersionStatus = "RUNNING"
	RuntimeVersionStatusError    RuntimeVersionStatus = "ERROR"
)

type RuntimeVersionInteractor struct {
	logger          logging.Logger
	resourceManager service.ResourceManagerService
}

func NewRuntimeVersionInteractor(
	logger logging.Logger,
	resourceManager service.ResourceManagerService,
) *RuntimeVersionInteractor {
	return &RuntimeVersionInteractor{
		logger,
		resourceManager,
	}
}

func (i *RuntimeVersionInteractor) CreateRuntimeVersion(name string) (*entity.RuntimeVersion, error) {
	result, err := i.resourceManager.CreateRuntimeVersion(name)
	if err != nil {
		return nil, err
	}

	i.logger.Info("K8sManagerService create result: " + result)

	// TODO: Wait until resources are created

	createdRuntimeVersion := &entity.RuntimeVersion{
		Name:   result,
		Status: "",
	}

	return createdRuntimeVersion, err
}
