package usecase

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

type RuntimeInteractor struct {
	logger            logging.Logger
	runtimeRepo       repository.RuntimeRepo
	k8sManagerService service.K8sManagerService
}

func NewRuntimeInteractor(
	logger logging.Logger,
	runtimeRepo repository.RuntimeRepo,
	k8sManagerService service.K8sManagerService) *RuntimeInteractor {
	return &RuntimeInteractor{
		logger,
		runtimeRepo,
		k8sManagerService,
	}
}

func (i *RuntimeInteractor) CreateRuntime(name string, userID string) (*entity.Runtime, error) {
	result, err := i.k8sManagerService.CreateRuntime(name)
	if err != nil {
		return nil, err
	}
	i.logger.Info("K8sManagerService create result: " + result)

	createdRuntime, err := i.runtimeRepo.Create(name, userID)
	if createdRuntime != nil {
		i.logger.Info("Runtime stored in the database with ID=" + createdRuntime.ID)
	}

	return createdRuntime, err
}
