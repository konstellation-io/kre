package usecase

import (
	"errors"
	"math/rand"
	"strings"
	"time"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

// RuntimeStatus enumerates all Runtime status
type RuntimeStatus string

var (
	// RuntimeStatusCreating status
	RuntimeStatusCreating RuntimeStatus = "CREATING"
	// RuntimeStatusRunning status
	RuntimeStatusRunning RuntimeStatus = "RUNNING"
	// RuntimeStatusError status
	RuntimeStatusError RuntimeStatus = "ERROR"
	// ErrRuntimeNotFound error
	ErrRuntimeNotFound = errors.New("error runtime not found")
)

// RuntimeInteractor contains app logic to handle Runtime entities
type RuntimeInteractor struct {
	logger            logging.Logger
	runtimeRepo       repository.RuntimeRepo
	k8sManagerService service.K8sManagerService
	userActivity      *UserActivityInteractor
}

// NewRuntimeInteractor creates a new RuntimeInteractor
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

// CreateRuntime adds a new Runtime
func (i *RuntimeInteractor) CreateRuntime(name string, userID string) (createdRuntime *entity.Runtime, onRuntimeRunningChannel chan *entity.Runtime, err error) {
	runtime := &entity.Runtime{
		Name:  name,
		Owner: userID,
		Mongo: entity.MongoConfig{
			Username:  "admin",
			Password:  generateRandomPassword(8),
			SharedKey: generateRandomPassword(8),
		},
		Minio: entity.MinioConfig{
			AccessKey: "admin",
			SecretKey: generateRandomPassword(8),
		},
	}
	createRuntimeInK8sResult, err := i.k8sManagerService.CreateRuntime(runtime)
	if err != nil {
		return
	}
	i.logger.Info("K8sManagerService create result: " + createRuntimeInK8sResult)

	createdRuntime, err = i.runtimeRepo.Create(runtime)
	if err != nil {
		return
	}
	i.logger.Info("Runtime stored in the database with ID=" + createdRuntime.ID)

	err = i.userActivity.Create(
		userID,
		UserActivityTypeCreateRuntime,
		[]entity.UserActivityVar{
			{
				Key:   "RUNTIME_ID",
				Value: createdRuntime.ID,
			},
			{
				Key:   "RUNTIME_NAME",
				Value: createdRuntime.Name,
			},
		})
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

// FindAll returns a list of all Runtimes
func (i *RuntimeInteractor) FindAll() ([]entity.Runtime, error) {
	return i.runtimeRepo.FindAll()
}

// GetByID return a Runtime by its ID
func (i *RuntimeInteractor) GetByID(runtimeID string) (*entity.Runtime, error) {
	return i.runtimeRepo.GetByID(runtimeID)
}

func generateRandomPassword(passwordLength int) string {
	rand.Seed(time.Now().UnixNano())
	chars := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"abcdefghijklmnopqrstuvwxyz" +
		"0123456789")
	var b strings.Builder
	for i := 0; i < passwordLength; i++ {
		b.WriteRune(chars[rand.Intn(len(chars))])
	}
	return b.String()
}
