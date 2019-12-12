package usecase

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"time"
)

type RuntimeStatus string

var (
	RuntimeStatusCreating RuntimeStatus = "CREATING"
	RuntimeStatusRunning  RuntimeStatus = "RUNNING"
	RuntimeStatusError    RuntimeStatus = "ERROR"
)

type RuntimeInteractor struct {
	logger            logging.Logger
	runtimeRepo       repository.RuntimeRepo
	k8sManagerService service.K8sManagerService
	userActivity      *UserActivityInteractor
}

func NewRuntimeInteractor(
	logger logging.Logger,
	runtimeRepo repository.RuntimeRepo,
	k8sManagerService service.K8sManagerService,
	userActivity *UserActivityInteractor,
) *RuntimeInteractor {
	return &RuntimeInteractor{
		logger,
		runtimeRepo,
		k8sManagerService,
		userActivity,
	}
}

func (i *RuntimeInteractor) CreateRuntime(name string, userID string, onCreated func(*entity.Runtime, error)) (*entity.Runtime, error) {
	result, err := i.k8sManagerService.CreateRuntime(name)
	if err != nil {
		return nil, err
	}
	i.logger.Info("K8sManagerService create result: " + result)

	createdRuntime, err := i.runtimeRepo.Create(name, userID)
	if createdRuntime != nil {
		i.logger.Info("Runtime stored in the database with ID=" + createdRuntime.ID)
	}

	err = i.userActivity.Create(userID, UserActivityTypeCreateRuntime)
	if err != nil {
		return nil, err
	}

	go func() {
		err := i.k8sManagerService.CheckRuntimeIsCreated(name)
		if err != nil {
			createdRuntime.Status = string(RuntimeStatusError)
			i.logger.Error(err.Error())
		} else {
			createdRuntime.Status = string(RuntimeStatusRunning)
		}

		time.Sleep(15 * time.Second)

		i.logger.Info("Set runtime status to " + createdRuntime.Status)
		err = i.runtimeRepo.Update(createdRuntime)
		if err != nil {
			i.logger.Error(err.Error())
		}

		onCreated(createdRuntime, err)
	}()

	return createdRuntime, err
}

func (i *RuntimeInteractor) FindAll() ([]entity.Runtime, error) {
	return i.runtimeRepo.FindAll()
}
