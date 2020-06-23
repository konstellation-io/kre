package usecase

import (
	"errors"

	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/repository"
	"github.com/konstellation-io/kre/admin-api/domain/service"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/runtime"
)

// RuntimeStatus enumerates all Runtime status
type RuntimeStatus string

var (
	// ErrRuntimeNotFound error
	ErrRuntimeNotFound = errors.New("error runtime not found")
)

// RuntimeInteractor contains app logic to handle Runtime entities
type RuntimeInteractor struct {
	logger            logging.Logger
	runtimeRepo       repository.RuntimeRepo
	runtimeService    service.RuntimeService
	userActivity      *UserActivityInteractor
	passwordGenerator runtime.PasswordGenerator
}

// NewRuntimeInteractor creates a new RuntimeInteractor
func NewRuntimeInteractor(
	logger logging.Logger,
	runtimeRepo repository.RuntimeRepo,
	runtimeService service.RuntimeService,
	userActivity *UserActivityInteractor,
	passwordGenerator runtime.PasswordGenerator,
) *RuntimeInteractor {
	return &RuntimeInteractor{
		logger,
		runtimeRepo,
		runtimeService,
		userActivity,
		passwordGenerator,
	}
}

// CreateRuntime adds a new Runtime
func (i *RuntimeInteractor) CreateRuntime(name string, description string, userID string) (createdRuntime *entity.Runtime, onRuntimeStartedChannel chan *entity.Runtime, err error) {
	runtime := &entity.Runtime{
		Name:        name,
		Description: description,
		Owner:       userID,
		Mongo: entity.MongoConfig{
			Username:  "admin",
			Password:  i.passwordGenerator.NewPassword(),
			SharedKey: i.passwordGenerator.NewPassword(),
		},
		Minio: entity.MinioConfig{
			AccessKey: "admin",
			SecretKey: i.passwordGenerator.NewPassword(),
		},
	}
	createRuntimeInK8sResult, err := i.runtimeService.Create(runtime)
	if err != nil {
		return
	}
	i.logger.Info("K8sManagerService create result: " + createRuntimeInK8sResult)

	createdRuntime, err = i.runtimeRepo.Create(runtime)
	if err != nil {
		return
	}
	i.logger.Info("Runtime stored in the database with ID=" + createdRuntime.ID)

	err = i.userActivity.RegisterCreateRuntime(userID, createdRuntime)
	if err != nil {
		return
	}

	onRuntimeStartedChannel = make(chan *entity.Runtime, 1)

	go func() {
		_, err := i.runtimeService.WaitForRuntimeStarted(createdRuntime)

		// If all pods are running, the runtime status should be set to running.
		// In other case, the runtime status will be set to error
		if err != nil {
			createdRuntime.Status = entity.RuntimeStatusError
			i.logger.Error(err.Error())
		} else {
			createdRuntime.Status = entity.RuntimeStatusStarted
		}

		i.logger.Infof("Set runtime status to %s", createdRuntime.Status.String())
		err = i.runtimeRepo.Update(createdRuntime) // TODO improve this using an atomic update operation instead of replace
		if err != nil {
			i.logger.Error(err.Error())
		}

		onRuntimeStartedChannel <- createdRuntime
		close(onRuntimeStartedChannel)
	}()

	return
}

// FindAll returns a list of all Runtimes
func (i *RuntimeInteractor) FindAll() ([]*entity.Runtime, error) {
	return i.runtimeRepo.FindAll()
}

// GetByID return a Runtime by its ID
func (i *RuntimeInteractor) GetByID(runtimeID string) (*entity.Runtime, error) {
	return i.runtimeRepo.GetByID(runtimeID)
}
