package usecase

import (
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
)

type VersionStatus string

var (
	VersionStatusCreating VersionStatus = "CREATING"
	VersionStatusRunning  VersionStatus = "RUNNING"
	VersionStatusError    VersionStatus = "ERROR"
)

var AllVersionStatus = []VersionStatus{
	VersionStatusCreating,
	VersionStatusRunning,
	VersionStatusError,
}

type VersionInteractor struct {
	logger          logging.Logger
	resourceManager service.ResourceManagerService
}

func NewVersionInteractor(
	logger logging.Logger,
	resourceManager service.ResourceManagerService,
) *VersionInteractor {
	return &VersionInteractor{
		logger,
		resourceManager,
	}
}

func (i *VersionInteractor) DeployVersion(name string) (*entity.Version, error) {
	err := i.resourceManager.DeployVersion(name)
	if err != nil {
		return nil, err
	}

	// TODO: Create all nodes defined on krt.yml

	err = i.resourceManager.ActivateVersion(name)
	if err != nil {
		return nil, err
	}

	createdVersion := &entity.Version{
		Name:   name,
		Status: string(VersionStatusCreating),
	}

	return createdVersion, err
}

func (i *VersionInteractor) ActivateVersion(name string) (*entity.Version, error) {
	err := i.resourceManager.ActivateVersion(name)
	if err != nil {
		return nil, err
	}

	activeVersion := &entity.Version{
		Name:   name,
		Status: string(VersionStatusRunning),
	}

	return activeVersion, err
}

func (i *VersionInteractor) CheckVersionIsCreated(name string) error {
	return i.resourceManager.CheckVersionIsCreated(name)
}
