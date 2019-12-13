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

var AllRuntimeVersionStatus = []RuntimeVersionStatus{
	RuntimeVersionStatusCreating,
	RuntimeVersionStatusRunning,
	RuntimeVersionStatusError,
}

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

func (i *RuntimeVersionInteractor) CreateRuntimeVersion(id, name string) (*entity.RuntimeVersion, error) {
	err := i.resourceManager.CreateRuntimeVersion(id, name)
	if err != nil {
		return nil, err
	}

	createdRuntimeVersion := &entity.RuntimeVersion{
		Name:   name,
		Status: string(RuntimeVersionStatusCreating),
	}

	return createdRuntimeVersion, err
}

func (i *RuntimeVersionInteractor) CheckRuntimeVersionIsCreated(id, name string) error {
	return i.resourceManager.CheckRuntimeVersionIsCreated(id, name)
}
