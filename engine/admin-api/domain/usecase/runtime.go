package usecase

import (
	"context"
	"errors"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/repository"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/runtime"
	"strings"
	"time"
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
	cfg               *config.Config
	logger            logging.Logger
	runtimeRepo       repository.RuntimeRepo
	userActivity      UserActivityInteracter
	passwordGenerator runtime.PasswordGenerator
	accessControl     auth.AccessControl
}

// NewRuntimeInteractor creates a new RuntimeInteractor
func NewRuntimeInteractor(
	cfg *config.Config,
	logger logging.Logger,
	runtimeRepo repository.RuntimeRepo,
	userActivity UserActivityInteracter,
	passwordGenerator runtime.PasswordGenerator,
	accessControl auth.AccessControl,
) *RuntimeInteractor {
	return &RuntimeInteractor{
		cfg,
		logger,
		runtimeRepo,
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
		//Owner:       loggedUserID,
		//Mongo: entity.MongoConfig{
		//	Username:  "admin",
		//	Password:  i.passwordGenerator.NewPassword(),
		//	SharedKey: i.passwordGenerator.NewPassword(),
		//},
		//Minio: entity.MinioConfig{
		//	AccessKey: "admin",
		//	SecretKey: i.passwordGenerator.NewPassword(),
		//},
	}

	// Validation
	//err = r.Validate()
	//if err != nil {
	//	return nil, nil, err
	//}

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

	// TODO: Do the actual runtime creation on k8s

	// Create runtime on repository
	createdRuntime, err = i.runtimeRepo.Create(ctx, r)
	if err != nil {
		return
	}
	i.logger.Info("Runtime stored in the database with ID=" + createdRuntime.ID)

	err = i.userActivity.RegisterCreateRuntime(loggedUserID, createdRuntime)
	if err != nil {
		return
	}

	// TODO: Wait for the runtime creation

	return
}

// EnsureRuntimeIsCreated creates the runtime in the DB if not exits
func (i *RuntimeInteractor) EnsureRuntimeIsCreated(ctx context.Context) error {
	r, err := i.runtimeRepo.Get(ctx)
	if err != nil && !errors.Is(err, ErrRuntimeNotFound) {
		return err
	}

	if r != nil {
		// NOTE: There already a runtime created
		return nil
	}

	r = &entity.Runtime{
		ID:           i.cfg.K8s.Namespace,
		Name:         strings.TrimSpace(i.cfg.Runtime.Name),
		Description:  "Runtime description...",
		CreationDate: time.Now().UTC(),
	}

	createdRuntime, err := i.runtimeRepo.Create(ctx, r)
	if err != nil {
		i.logger.Errorf("Error creating runtime: %s", err)
		return err
	}
	i.logger.Info("Runtime stored in the database with ID=" + createdRuntime.ID)

	return nil
}

// Get return the current Runtime
func (i *RuntimeInteractor) Get(ctx context.Context, loggedUserID string) (*entity.Runtime, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResRuntime, auth.ActView); err != nil {
		return nil, err
	}

	return i.runtimeRepo.Get(ctx)
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
