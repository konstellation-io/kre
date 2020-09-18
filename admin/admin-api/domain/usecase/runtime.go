package usecase

import (
	"context"
	"errors"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"strings"
	"time"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/repository"
	"github.com/konstellation-io/kre/admin/admin-api/domain/service"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/runtime"
)

// RuntimeStatus enumerates all Runtime status
type RuntimeStatus string

var (
	// ErrRuntimeNotFound error
	ErrRuntimeNotFound       = errors.New("error runtime not found")
	ErrRuntimeDuplicated     = errors.New("there is already a runtime with the same id")
	ErrRuntimeDuplicatedName = errors.New("there is already a runtime with the same name")
)

// RuntimeInteractor contains app logic to handle Runtime entities
type RuntimeInteractor struct {
	logger            logging.Logger
	runtimeRepo       repository.RuntimeRepo
	runtimeService    service.RuntimeService
	userActivity      *UserActivityInteractor
	passwordGenerator runtime.PasswordGenerator
	accessControl     auth.AccessControl
}

// NewRuntimeInteractor creates a new RuntimeInteractor
func NewRuntimeInteractor(
	logger logging.Logger,
	runtimeRepo repository.RuntimeRepo,
	runtimeService service.RuntimeService,
	userActivity *UserActivityInteractor,
	passwordGenerator runtime.PasswordGenerator,
	accessControl auth.AccessControl,
) *RuntimeInteractor {
	return &RuntimeInteractor{
		logger,
		runtimeRepo,
		runtimeService,
		userActivity,
		passwordGenerator,
		accessControl,
	}
}

// CreateRuntime adds a new Runtime
func (i *RuntimeInteractor) CreateRuntime(ctx context.Context, loggedUserID, runtimeID, name, description string) (createdRuntime *entity.Runtime, onRuntimeStartedChannel chan *entity.Runtime, err error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResRuntime, auth.ActEdit); err != nil {
		return nil, nil, err
	}

	// Sanitize input params
	runtimeID = strings.TrimSpace(runtimeID)
	name = strings.TrimSpace(name)
	description = strings.TrimSpace(description)

	r := &entity.Runtime{
		ID:          runtimeID,
		Name:        name,
		Description: description,
		Owner:       loggedUserID,
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

	// Validation
	err = r.Validate()
	if err != nil {
		return nil, nil, err
	}

	// Check if the Runtime already exists
	runtimeFromDB, err := i.runtimeRepo.GetByID(ctx, runtimeID)
	if runtimeFromDB != nil {
		return nil, nil, ErrRuntimeDuplicated
	} else if err != ErrRuntimeNotFound {
		return nil, nil, err
	}

	// Check if there is another Runtime with the same name
	runtimeFromDB, err = i.runtimeRepo.GetByName(ctx, name)
	if runtimeFromDB != nil {
		return nil, nil, ErrRuntimeDuplicatedName
	} else if err != ErrRuntimeNotFound {
		return nil, nil, err
	}

	createRuntimeInK8sResult, err := i.runtimeService.Create(ctx, r)
	if err != nil {
		return
	}
	i.logger.Info("K8sManagerService create result: " + createRuntimeInK8sResult)

	createdRuntime, err = i.runtimeRepo.Create(ctx, r)
	if err != nil {
		return
	}
	i.logger.Info("Runtime stored in the database with ID=" + createdRuntime.ID)

	err = i.userActivity.RegisterCreateRuntime(loggedUserID, createdRuntime)
	if err != nil {
		return
	}

	onRuntimeStartedChannel = make(chan *entity.Runtime, 1)

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
		defer cancel()

		_, err := i.runtimeService.WaitForRuntimeStarted(ctx, createdRuntime)

		// If all pods are running, the runtime status should be set to running.
		// In other case, the runtime status will be set to error
		if err != nil {
			createdRuntime.Status = entity.RuntimeStatusError
			i.logger.Errorf("Error creating runtime: %s", err)
		} else {
			createdRuntime.Status = entity.RuntimeStatusStarted
		}

		i.logger.Infof("Set runtime status to %s", createdRuntime.Status.String())
		err = i.runtimeRepo.UpdateStatus(ctx, createdRuntime.ID, createdRuntime.Status)
		if err != nil {
			i.logger.Errorf("Error updating runtime: %s", err)
		}

		onRuntimeStartedChannel <- createdRuntime
		close(onRuntimeStartedChannel)
	}()

	return
}

// FindAll returns a list of all Runtimes
func (i *RuntimeInteractor) FindAll(ctx context.Context, loggedUserID string) ([]*entity.Runtime, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResRuntime, auth.ActView); err != nil {
		return nil, err
	}

	return i.runtimeRepo.FindAll(ctx)
}

// GetByID return a Runtime by its ID
func (i *RuntimeInteractor) GetByID(ctx context.Context, loggedUserID string, runtimeID string) (*entity.Runtime, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResRuntime, auth.ActView); err != nil {
		return nil, err
	}

	return i.runtimeRepo.GetByID(ctx, runtimeID)
}
