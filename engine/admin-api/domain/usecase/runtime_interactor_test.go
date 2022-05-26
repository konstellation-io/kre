package usecase_test

import (
	"context"
	"testing"
	"time"

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
	runtimeRepo       *mocks.MockRuntimeRepo
	userActivityRepo  *mocks.MockUserActivityRepo
	userRepo          *mocks.MockUserRepo
	passwordGenerator *mocks.MockPasswordGenerator
	accessControl     *mocks.MockAccessControl
}

const (
	k8sNamespace       = "kre-test"
	defaultRuntimeName = "kre-test-runtime"
)

func newRuntimeSuite(t *testing.T) *runtimeSuite {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
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

	cfg.K8s.Namespace = k8sNamespace
	cfg.Runtime.Name = defaultRuntimeName

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
			runtimeRepo,
			userActivityRepo,
			userRepo,
			passwordGenerator,
			accessControl,
		},
	}
}

func TestGet(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	runtimeID := "runtime1"
	expectedRuntime := &entity.Runtime{
		ID: runtimeID,
	}

	userID := "user1234"
	ctx := context.Background()

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActView)
	s.mocks.runtimeRepo.EXPECT().Get(ctx).Return(expectedRuntime, nil)

	runtime, err := s.runtimeInteractor.Get(ctx, userID)
	require.Nil(t, err)
	require.Equal(t, expectedRuntime, runtime)
}

func TestCreateNewRuntime(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	userID := "user1234"
	newRuntimeId := "runtime-id"
	newRuntimeName := "runtime-name"
	newRuntimeDescription := "This is a runtime description"
	expectedRuntime := &entity.Runtime{
		ID:           newRuntimeId,
		Name:         newRuntimeName,
		Description:  newRuntimeDescription,
		CreationDate: time.Time{},
		Owner:        userID,
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActEdit).Return(nil)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, newRuntimeId).Return(nil, usecase.ErrRuntimeNotFound)
	s.mocks.runtimeRepo.EXPECT().GetByName(ctx, newRuntimeName).Return(nil, usecase.ErrRuntimeNotFound)
	s.mocks.runtimeRepo.EXPECT().Create(ctx, expectedRuntime).Return(expectedRuntime, nil)

	runtime, err := s.runtimeInteractor.CreateRuntime(ctx, userID, newRuntimeId, newRuntimeName, newRuntimeDescription)

	require.Nil(t, err)
	require.Equal(t, expectedRuntime, runtime)
}

func TestEnsureRuntimeIsCreated(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	defaultRuntime := &entity.Runtime{
		ID:           k8sNamespace,
		Name:         defaultRuntimeName,
		Description:  "Runtime description...",
		CreationDate: time.Time{},
	}

	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, k8sNamespace).Return(nil, usecase.ErrRuntimeNotFound)
	s.mocks.runtimeRepo.EXPECT().Create(ctx, defaultRuntime).Return(defaultRuntime, nil)

	err := s.runtimeInteractor.EnsureRuntimeIsCreated(ctx)

	require.Nil(t, err)
}

func TestGetByID(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	userID := "user1"
	runtimeID := "runtime-id"
	runtimeName := "runtime-name"

	expected := &entity.Runtime{
		ID:           runtimeID,
		Name:         runtimeName,
		Description:  "Runtime description...",
		CreationDate: time.Time{},
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActView).Return(nil)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, runtimeID).Return(expected, nil)

	actual, err := s.runtimeInteractor.GetByID(ctx, userID, runtimeID)

	require.Nil(t, err)
	require.Equal(t, expected, actual)
}

func TestFindAll(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	userID := "user1"
	runtimeID := "runtime-id"
	runtimeName := "runtime-name"

	expected := []*entity.Runtime{
		{
			ID:           runtimeID,
			Name:         runtimeName,
			Description:  "Runtime description...",
			CreationDate: time.Time{},
		},
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActView).Return(nil)
	s.mocks.runtimeRepo.EXPECT().FindAll(ctx).Return(expected, nil)

	actual, err := s.runtimeInteractor.FindAll(ctx, userID)

	require.Nil(t, err)
	require.Equal(t, expected, actual)
}
