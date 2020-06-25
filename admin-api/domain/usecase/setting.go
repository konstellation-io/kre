package usecase

import (
	"context"
	"errors"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/auth"

	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/repository"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
)

// DefaultSessionLifetimeInDays ttl of the users sessions in days
const DefaultSessionLifetimeInDays = 30

// SettingInteractor contains app logic about Settings entities
type SettingInteractor struct {
	logger        logging.Logger
	settingRepo   repository.SettingRepo
	userActivity  *UserActivityInteractor
	accessControl auth.AccessControl
}

// NewSettingInteractor creates a new SettingInteractor
func NewSettingInteractor(
	logger logging.Logger,
	settingRepo repository.SettingRepo,
	userActivity *UserActivityInteractor,
	accessControl auth.AccessControl,
) *SettingInteractor {
	return &SettingInteractor{
		logger,
		settingRepo,
		userActivity,
		accessControl,
	}
}

var (
	// ErrSettingNotFound error
	ErrSettingNotFound = errors.New("setting not found")
)

// CreateDefaults create a new Settings with defaults values
func (i *SettingInteractor) CreateDefaults(ctx context.Context) error {
	_, err := i.settingRepo.Get(ctx)

	if err == ErrSettingNotFound {
		s := entity.Settings{
			SessionLifetimeInDays: DefaultSessionLifetimeInDays,
		}

		i.logger.Infof("Creating default values for settings")
		return i.settingRepo.Create(s)
	}

	if err != nil {
		return err
	}

	return nil
}

// Update change a given Settings to a new value
func (i *SettingInteractor) Update(loggedUserID string, settings *entity.Settings, changes []entity.UserActivity) error {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResSettings, auth.ActEdit); err != nil {
		return err
	}

	for _, c := range changes {
		err := i.userActivity.RegisterUpdateSettings(c.UserID, c.Vars)
		if err != nil {
			return err
		}
	}

	return i.settingRepo.Update(settings)
}

// Get returns a Settings
func (i *SettingInteractor) GetUnprotected(ctx context.Context) (*entity.Settings, error) {
	return i.settingRepo.Get(ctx)
}

// Get returns a Settings
func (i *SettingInteractor) Get(ctx context.Context, loggedUserID string) (*entity.Settings, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResSettings, auth.ActView); err != nil {
		return nil, err
	}

	return i.settingRepo.Get(ctx)
}
