package usecase_test

import (
	"context"
	"testing"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
)

type runtimeSuite struct {
	ctrl              *gomock.Controller
	runtimeInteractor *usecase.RuntimeInteractor
	mocks             *runtimeSuiteMocks
}

type runtimeSuiteMocks struct {
	logger            *mocks.MockLogger
	runtimeService    *mocks.MockRuntimeService
	runtimeRepo       *mocks.MockRuntimeRepo
	userActivityRepo  *mocks.MockUserActivityRepo
	userRepo          *mocks.MockUserRepo
	passwordGenerator *mocks.MockPasswordGenerator
	accessControl     *mocks.MockAccessControl
}

func newRuntimeSuite(t *testing.T) *runtimeSuite {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	runtimeService := mocks.NewMockRuntimeService(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	passwordGenerator := mocks.NewMockPasswordGenerator(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivity := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		userRepo,
		accessControl,
	)

	cfg := &config.Config{}

	runtimeInteractor := usecase.NewRuntimeInteractor(
		cfg,
		logger,
		runtimeRepo,
		userActivity,
		passwordGenerator,
		accessControl,
	)

	return &runtimeSuite{
		ctrl:              ctrl,
		runtimeInteractor: runtimeInteractor,
		mocks: &runtimeSuiteMocks{
			logger,
			runtimeService,
			runtimeRepo,
			userActivityRepo,
			userRepo,
			passwordGenerator,
			accessControl,
		},
	}
}

func TestFindAll(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	expectedRuntimes := []*entity.Runtime{
		{
			ID: "runtime1",
		},
		{
			ID: "runtime2",
		},
	}
	userID := "user1234"

	ctx := context.Background()
	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActView)
	s.mocks.runtimeRepo.EXPECT().FindAll(ctx).Return(expectedRuntimes, nil)

	runtimes, err := s.runtimeInteractor.FindAll(ctx, userID)
	require.Nil(t, err)
	require.Equal(t, expectedRuntimes, runtimes)
}

func TestGetByID(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	runtimeID := "runtime1"
	expectedRuntime := &entity.Runtime{
		ID: runtimeID,
	}

	userID := "user1234"
	ctx := context.Background()

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActView)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, runtimeID).Return(expectedRuntime, nil)

	runtime, err := s.runtimeInteractor.GetByID(ctx, userID, runtimeID)
	require.Nil(t, err)
	require.Equal(t, expectedRuntime, runtime)
}
