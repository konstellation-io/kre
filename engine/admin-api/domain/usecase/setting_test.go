package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
)

type settingTest struct {
	ctrl              *gomock.Controller
	settingInteractor usecase.SettingInteracter
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
	accessControl := mocks.NewMockAccessControl(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivity := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		userRepo,
		accessControl,
	)

	settingInteractor := usecase.NewSettingInteractor(
		logger,
		settingRepo,
		userActivity,
		accessControl,
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

	expectedSettings := entity.Settings{
		SessionLifetimeInDays: usecase.DefaultSessionLifetimeInDays,
	}

	ctx := context.Background()

	s.mocks.settingRepo.EXPECT().Get(ctx).Return(nil, usecase.ErrSettingNotFound)
	s.mocks.settingRepo.EXPECT().Create(expectedSettings).Return(nil)

	err := s.settingInteractor.CreateDefaults(ctx)
	require.Nil(t, err)
}

func TestCreateDefaultsNoOverridesCurrentValues(t *testing.T) {
	s := newSettingTest(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	s.mocks.settingRepo.EXPECT().Get(ctx).Return(nil, nil)

	err := s.settingInteractor.CreateDefaults(ctx)
	require.Nil(t, err)
}

func TestCreateDefaultsReturnsAnError(t *testing.T) {
	s := newSettingTest(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	expectedErr := errors.New("some error")
	s.mocks.settingRepo.EXPECT().Get(ctx).Return(nil, expectedErr)

	err := s.settingInteractor.CreateDefaults(ctx)
	require.Equal(t, expectedErr, err)
}
