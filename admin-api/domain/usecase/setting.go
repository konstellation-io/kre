package usecase

import (
	"errors"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

const DefaultSessionLifetimeInDays = 30

type SettingInteractor struct {
	logger      logging.Logger
	settingRepo repository.SettingRepo
}

func NewSettingInteractor(logger logging.Logger, settingRepo repository.SettingRepo) *SettingInteractor {
	return &SettingInteractor{
		logger,
		settingRepo,
	}
}

var (
	ErrSettingNotFound = errors.New("setting not found")
)

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

func (i *SettingInteractor) Update(settings entity.Setting) error {
	return i.settingRepo.Update(settings)
}

func (i *SettingInteractor) Get() (entity.Setting, error) {
	return i.settingRepo.Get()
}
