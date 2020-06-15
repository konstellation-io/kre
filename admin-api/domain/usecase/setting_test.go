package usecase_test

import (
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin-api/mocks"
)

type settingTest struct {
	ctrl              *gomock.Controller
	settingInteractor *usecase.SettingInteractor
	mocks             *settingTestMocks
}

type settingTestMocks struct {
	logger           *mocks.MockLogger
	settingRepo      *mocks.MockSettingRepo
	userActivityRepo *mocks.MockUserActivityRepo
	userRepo         *mocks.MockUserRepo
}

func newSettingTest(t *testing.T) *settingTest {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	settingRepo := mocks.NewMockSettingRepo(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivity := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		userRepo,
	)

	settingInteractor := usecase.NewSettingInteractor(
		logger,
		settingRepo,
		userActivity,
	)

	return &settingTest{
		ctrl:              ctrl,
		settingInteractor: settingInteractor,
		mocks: &settingTestMocks{
			logger:           logger,
			settingRepo:      settingRepo,
			userActivityRepo: userActivityRepo,
			userRepo:         userRepo,
		},
	}
}

func TestCreateDefaults(t *testing.T) {
	s := newSettingTest(t)
	defer s.ctrl.Finish()

	expectedSettings := entity.Setting{
		SessionLifetimeInDays: usecase.DefaultSessionLifetimeInDays,
	}

	s.mocks.settingRepo.EXPECT().Get().Return(nil, usecase.ErrSettingNotFound)
	s.mocks.settingRepo.EXPECT().Create(expectedSettings).Return(nil)

	err := s.settingInteractor.CreateDefaults()
	require.Nil(t, err)
}

func TestCreateDefaultsNoOverridesCurrentValues(t *testing.T) {
	s := newSettingTest(t)
	defer s.ctrl.Finish()

	s.mocks.settingRepo.EXPECT().Get().Return(nil, nil)

	err := s.settingInteractor.CreateDefaults()
	require.Nil(t, err)
}

func TestCreateDefaultsReturnsAnError(t *testing.T) {
	s := newSettingTest(t)
	defer s.ctrl.Finish()

	expectedErr := errors.New("some error")
	s.mocks.settingRepo.EXPECT().Get().Return(nil, expectedErr)

	err := s.settingInteractor.CreateDefaults()
	require.Equal(t, expectedErr, err)
}
