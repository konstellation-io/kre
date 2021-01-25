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
	ErrRuntimeNotFound = errors.New("error runtime not found")
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
