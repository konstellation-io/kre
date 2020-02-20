package usecase

import (
	"errors"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

// DefaultSessionLifetimeInDays ttl of the users sessions in days
const DefaultSessionLifetimeInDays = 30

// SettingInteractor contains app logic about Setting entities
type SettingInteractor struct {
	logger       logging.Logger
	settingRepo  repository.SettingRepo
	userActivity *UserActivityInteractor
}

// NewSettingInteractor creates a new SettingInteractor
func NewSettingInteractor(
	logger logging.Logger,
	settingRepo repository.SettingRepo,
	userActivity *UserActivityInteractor,
) *SettingInteractor {
	return &SettingInteractor{
		logger,
		settingRepo,
		userActivity,
	}
}

var (
	// ErrSettingNotFound error
	ErrSettingNotFound = errors.New("setting not found")
)

// CreateDefaults create a new Setting with defaults values
func (i *SettingInteractor) CreateDefaults() error {
	_, err := i.settingRepo.Get()

	if err == ErrSettingNotFound {
		s := entity.Setting{
			SessionLifetimeInDays: DefaultSessionLifetimeInDays,
		}

		i.logger.Info("Creating default values for settings.")
		return i.settingRepo.Create(s)
	}

	if err != nil {
		return err
	}

	return nil
}

// Update change a given Setting to a new value
func (i *SettingInteractor) Update(settings *entity.Setting, changes []entity.UserActivity) error {
	for _, c := range changes {
		err := i.userActivity.RegisterUpdateSettings(c.UserID, c.Vars)
		if err != nil {
			return err
		}
	}

	return i.settingRepo.Update(settings)
}

// Get returns a Setting
func (i *SettingInteractor) Get() (*entity.Setting, error) {
	return i.settingRepo.Get()
}
