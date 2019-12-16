package usecase

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
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

func (i *RuntimeInteractor) CreateRuntime(name string, userID string) (createdRuntime *entity.Runtime, onRuntimeRunningChannel chan *entity.Runtime, err error) {
	createRuntimeInK8sResult, err := i.k8sManagerService.CreateRuntime(name)
	if err != nil {
		return
	}
	i.logger.Info("K8sManagerService create result: " + createRuntimeInK8sResult)

	createdRuntime, err = i.runtimeRepo.Create(name, userID)
	if err != nil {
		return
	}
	i.logger.Info("Runtime stored in the database with ID=" + createdRuntime.ID)

	err = i.userActivity.Create(userID, UserActivityTypeCreateRuntime)
	if err != nil {
		return
	}

	onRuntimeRunningChannel = make(chan *entity.Runtime, 1)

	go func() {
		err := i.k8sManagerService.CheckRuntimeIsCreated(name)

		// If all pods are running, the runtime status should be set to running.
		// In other case, the runtime status will be set to error
		if err != nil {
			createdRuntime.Status = string(RuntimeStatusError)
			i.logger.Error(err.Error())
		} else {
			createdRuntime.Status = string(RuntimeStatusRunning)
		}

		i.logger.Info("Set runtime status to " + createdRuntime.Status)
		err = i.runtimeRepo.Update(createdRuntime) // TODO improve this using an atomic update operation instead of replace
		if err != nil {
			i.logger.Error(err.Error())
		}

		onRuntimeRunningChannel <- createdRuntime
		close(onRuntimeRunningChannel)
	}()

	return
}

func (i *RuntimeInteractor) FindAll() ([]entity.Runtime, error) {
	return i.runtimeRepo.FindAll()
}
