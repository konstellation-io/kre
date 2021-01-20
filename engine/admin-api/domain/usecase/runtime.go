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

// RuntimeStatus enumerates all Runtime status
type RuntimeStatus string

var (
	// ErrRuntimeNotFound error
	ErrRuntimeNotFound = errors.New("error runtime not found")
	ErrMonoruntimeMode = errors.New("this action is disabled in monoruntime mode")
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

func (i *RuntimeInteractor) EnsureMonoruntime(ctx context.Context, ownerUser *entity.User) error {
	all, err := i.runtimeRepo.FindAll(ctx)
	if err != nil {
		return err
	}

	ownerUserID := ownerUser.ID
	runtimeName := i.cfg.Monoruntime.Name
	// Using namespace for ID and descriptive name
	runtimeID := i.cfg.Monoruntime.Namespace
	description := i.cfg.Monoruntime.Namespace

	if len(all) > 0 {
		// NOTE: There already a runtime created
		return nil
	}

	// Sanitize input params
	runtimeID = strings.TrimSpace(runtimeID)
	name := strings.TrimSpace(runtimeName)
	description = strings.TrimSpace(description)

	r := &entity.Runtime{
		ID:          i.cfg.Monoruntime.Namespace,
		Name:        name,
		Description: description,
		Owner:       ownerUserID,
		Mongo: entity.MongoConfig{
			Username: i.cfg.Monoruntime.Mongo.Username,
			Password: i.cfg.Monoruntime.Mongo.Password,
		},
		Status:      entity.RuntimeStatusStarted,
		Monoruntime: true,
		ReleaseName: i.cfg.Monoruntime.ReleaseName,
	}

	createdRuntime, err := i.runtimeRepo.Create(ctx, r)
	if err != nil {
		i.logger.Errorf("Error create monoruntime: %s", err)
		return err
	}
	i.logger.Info("Monoruntime stored in the database with ID=" + createdRuntime.ID)

	return nil
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
