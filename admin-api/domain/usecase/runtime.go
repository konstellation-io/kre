package usecase

import (
	"errors"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"math/rand"
	"time"
)

type RuntimeStatus string

var (
	RuntimeStatusCreating RuntimeStatus = "CREATING"
	RuntimeStatusRunning  RuntimeStatus = "RUNNING"
	RuntimeStatusError    RuntimeStatus = "ERROR"
	ErrRuntimeNotFound                  = errors.New("error runtime not found")
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
	runtime := &entity.Runtime{
		Name:  name,
		Owner: userID,
		// TODO: make it random per namespace
		Minio: entity.MinioConfig{
			AccessKey: "admin",
			SecretKey: generateRandomPassword(),
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

func (i *RuntimeInteractor) GetByID(runtimeID string) (*entity.Runtime, error) {
	return i.runtimeRepo.GetByID(runtimeID)
}

func generateRandomPassword() string {
	passwordLength := 8
	rand.Seed(time.Now().UnixNano())
	digits := "0123456789"
	specials := "%*@#$"
	all := "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"abcdefghijklmnopqrstuvwxyz" +
		digits + specials
	buf := make([]byte, passwordLength)
	buf[0] = digits[rand.Intn(len(digits))]
	buf[1] = specials[rand.Intn(len(specials))]
	for i := 2; i < passwordLength; i++ {
		buf[i] = all[rand.Intn(len(all))]
	}
	rand.Shuffle(len(buf), func(i, j int) {
		buf[i], buf[j] = buf[j], buf[i]
	})
	str := string(buf)
	return str
}
