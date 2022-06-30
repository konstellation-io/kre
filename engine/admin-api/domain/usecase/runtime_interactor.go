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
)

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
	measurementRepo   repository.MeasurementRepo
	versionRepo       repository.VersionRepo
	metricRepo        repository.MetricRepo
	nodeLogRepo       repository.NodeLogRepository
	userActivity      UserActivityInteracter
	passwordGenerator runtime.PasswordGenerator
	accessControl     auth.AccessControl
}

// NewRuntimeInteractor creates a new RuntimeInteractor
func NewRuntimeInteractor(
	cfg *config.Config,
	logger logging.Logger,
	runtimeRepo repository.RuntimeRepo,
	measurementRepo repository.MeasurementRepo,
	versionRepo repository.VersionRepo,
	metricRepo repository.MetricRepo,
	nodeLogRepo repository.NodeLogRepository,
	userActivity UserActivityInteracter,
	passwordGenerator runtime.PasswordGenerator,
	accessControl auth.AccessControl,
) *RuntimeInteractor {
	return &RuntimeInteractor{
		cfg,
		logger,
		runtimeRepo,
		measurementRepo,
		versionRepo,
		metricRepo,
		nodeLogRepo,
		userActivity,
		passwordGenerator,
		accessControl,
	}
}

// CreateRuntime adds a new Runtime
func (i *RuntimeInteractor) CreateRuntime(ctx context.Context, loggedUserID, runtimeID, name, description string) (createdRuntime *entity.Runtime, err error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResRuntime, auth.ActEdit); err != nil {
		return nil, err
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
	}

	// Validation
	err = r.Validate()
	if err != nil {
		return nil, err
	}

	// Check if the Runtime already exists
	runtimeFromDB, err := i.runtimeRepo.GetByID(ctx, runtimeID)
	if runtimeFromDB != nil {
		return nil, ErrRuntimeDuplicated
	} else if err != ErrRuntimeNotFound {
		return nil, err
	}

	// Check if there is another Runtime with the same name
	runtimeFromDB, err = i.runtimeRepo.GetByName(ctx, name)
	if runtimeFromDB != nil {
		return nil, ErrRuntimeDuplicatedName
	} else if err != ErrRuntimeNotFound {
		return nil, err
	}

	createdRuntime, err = i.runtimeRepo.Create(ctx, r)
	if err != nil {
		return nil, err
	}
	i.logger.Info("Runtime stored in the database with ID=" + createdRuntime.ID)

	err = i.measurementRepo.CreateDatabase(createdRuntime.ID)
	if err != nil {
		return nil, err
	}

	err = i.createDatabaseIndexes(ctx, runtimeID)
	if err != nil {
		return nil, err
	}

	i.logger.Info("Measurement database created for runtime with ID=" + createdRuntime.ID)

	return createdRuntime, nil
}

func (i *RuntimeInteractor) createDatabaseIndexes(ctx context.Context, runtimeId string) error {
	err := i.metricRepo.CreateIndexes(ctx, runtimeId)
	if err != nil {
		return err
	}

	err = i.nodeLogRepo.CreateIndexes(ctx, runtimeId)
	if err != nil {
		return err
	}

	return i.versionRepo.CreateIndexes(ctx, runtimeId)
}

// Get return the current Runtime
func (i *RuntimeInteractor) Get(ctx context.Context, loggedUserID string) (*entity.Runtime, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResRuntime, auth.ActView); err != nil {
		return nil, err
	}

	return i.runtimeRepo.Get(ctx)
}

// GetByID return a Runtime by its ID
func (i *RuntimeInteractor) GetByID(ctx context.Context, loggedUserID string, runtimeID string) (*entity.Runtime, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResRuntime, auth.ActView); err != nil {
		return nil, err
	}

	return i.runtimeRepo.GetByID(ctx, runtimeID)
}

// FindAll returns a list of all Runtimes
func (i *RuntimeInteractor) FindAll(ctx context.Context, loggedUserID string) ([]*entity.Runtime, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResRuntime, auth.ActView); err != nil {
		return nil, err
	}

	return i.runtimeRepo.FindAll(ctx)
}
