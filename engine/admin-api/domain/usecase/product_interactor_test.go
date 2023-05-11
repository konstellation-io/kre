package usecase_test

import (
	"context"
	"errors"
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
	runtimeInteractor *usecase.ProductInteractor
	mocks             *runtimeSuiteMocks
}

type runtimeSuiteMocks struct {
	logger           *mocks.MockLogger
	runtimeRepo      *mocks.MockRuntimeRepo
	measurementRepo  *mocks.MockMeasurementRepo
	versionRepo      *mocks.MockVersionRepo
	metricRepo       *mocks.MockMetricRepo
	nodeLogRepo      *mocks.MockNodeLogRepository
	userActivityRepo *mocks.MockUserActivityRepo
	accessControl    *mocks.MockAccessControl
}

const (
	k8sNamespace = "kre-test"
)

func newRuntimeSuite(t *testing.T) *runtimeSuite {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	measurementRepo := mocks.NewMockMeasurementRepo(ctrl)
	versionRepo := mocks.NewMockVersionRepo(ctrl)
	metricRepo := mocks.NewMockMetricRepo(ctrl)
	nodeLogRepo := mocks.NewMockNodeLogRepository(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivity := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		accessControl,
	)

	cfg := &config.Config{}

	cfg.K8s.Namespace = k8sNamespace

	runtimeInteractor := usecase.NewProductInteractor(
		cfg,
		logger,
		runtimeRepo,
		measurementRepo,
		versionRepo,
		metricRepo,
		nodeLogRepo,
		userActivity,
		accessControl,
	)

	return &runtimeSuite{
		ctrl:              ctrl,
		runtimeInteractor: runtimeInteractor,
		mocks: &runtimeSuiteMocks{
			logger,
			runtimeRepo,
			measurementRepo,
			versionRepo,
			metricRepo,
			nodeLogRepo,
			userActivityRepo,
			accessControl,
		},
	}
}

func TestGet(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	runtimeID := "runtime1"
	expectedRuntime := &entity.Product{
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
	newRuntimeID := "runtime-id"
	newRuntimeName := "runtime-name"
	newRuntimeDescription := "This is a runtime description"
	expectedRuntime := &entity.Product{
		ID:           newRuntimeID,
		Name:         newRuntimeName,
		Description:  newRuntimeDescription,
		CreationDate: time.Time{},
		Owner:        userID,
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActEdit).Return(nil)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, newRuntimeID).Return(nil, usecase.ErrProductNotFound)
	s.mocks.runtimeRepo.EXPECT().GetByName(ctx, newRuntimeName).Return(nil, usecase.ErrProductNotFound)
	s.mocks.runtimeRepo.EXPECT().Create(ctx, expectedRuntime).Return(expectedRuntime, nil)
	s.mocks.measurementRepo.EXPECT().CreateDatabase(newRuntimeID).Return(nil)
	s.mocks.versionRepo.EXPECT().CreateIndexes(ctx, newRuntimeID).Return(nil)
	s.mocks.metricRepo.EXPECT().CreateIndexes(ctx, newRuntimeID).Return(nil)
	s.mocks.nodeLogRepo.EXPECT().CreateIndexes(ctx, newRuntimeID).Return(nil)

	runtime, err := s.runtimeInteractor.CreateRuntime(ctx, userID, newRuntimeID, newRuntimeName, newRuntimeDescription)

	require.Nil(t, err)
	require.Equal(t, expectedRuntime, runtime)
}

func TestCreateNewRuntime_FailsIfUserHasNotPermission(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	userID := "user1234"
	newRuntimeID := "runtime-id"
	newRuntimeName := "runtime-name"
	newRuntimeDescription := "This is a runtime description"

	permissionError := errors.New("permission error")

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActEdit).Return(permissionError)

	runtime, err := s.runtimeInteractor.CreateRuntime(ctx, userID, newRuntimeID, newRuntimeName, newRuntimeDescription)

	require.Error(t, permissionError, err)
	require.Nil(t, runtime)
}

func TestCreateNewRuntime_FailsIfRuntimeHasAnInvalidField(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	userID := "user1234"
	newRuntimeID := "runtime-id"
	// the runtime name is bigger thant the max length (it should be lte=40)
	newRuntimeName := "lore ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labores"
	newRuntimeDescription := "This is a runtime description"

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActEdit).Return(nil)

	runtime, err := s.runtimeInteractor.CreateRuntime(ctx, userID, newRuntimeID, newRuntimeName, newRuntimeDescription)

	require.Error(t, err)
	require.Nil(t, runtime)
}

func TestCreateNewRuntime_FailsIfRuntimeWithSameIDAlreadyExists(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	userID := "user1234"
	runtimeID := "runtime-id"
	newRuntimeName := "runtime-name"
	newRuntimeDescription := "This is a runtime description"

	existingRuntime := &entity.Product{
		ID:          runtimeID,
		Name:        "existing-runtime-name",
		Description: "existing-runtime-description",
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActEdit).Return(nil)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, runtimeID).Return(existingRuntime, nil)

	runtime, err := s.runtimeInteractor.CreateRuntime(ctx, userID, runtimeID, newRuntimeName, newRuntimeDescription)

	require.Error(t, err)
	require.Nil(t, runtime)
}

func TestCreateNewRuntime_FailsIfRuntimeWithSameNameAlreadyExists(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	userID := "user1234"
	runtimeName := "runtime-name"
	newRuntimeID := "new-runtime-id"
	newRuntimeDescription := "This is a runtime description"

	existingRuntime := &entity.Product{
		ID:          "existing-runtime-id",
		Name:        runtimeName,
		Description: "existing-runtime-description",
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActEdit).Return(nil)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, newRuntimeID).Return(nil, usecase.ErrProductNotFound)
	s.mocks.runtimeRepo.EXPECT().GetByName(ctx, runtimeName).Return(existingRuntime, nil)

	runtime, err := s.runtimeInteractor.CreateRuntime(ctx, userID, newRuntimeID, runtimeName, newRuntimeDescription)

	require.Error(t, err)
	require.Nil(t, runtime)
}

func TestCreateNewRuntime_FailsIfCreateRuntimeFails(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	userID := "user1234"
	newRuntimeName := "runtime-name"
	newRuntimeID := "new-runtime-id"
	newRuntimeDescription := "This is a runtime description"

	newRuntime := &entity.Product{
		ID:           newRuntimeID,
		Name:         newRuntimeName,
		Description:  newRuntimeDescription,
		Owner:        userID,
		CreationDate: time.Time{},
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResRuntime, auth.ActEdit).Return(nil)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, newRuntimeID).Return(nil, usecase.ErrProductNotFound)
	s.mocks.runtimeRepo.EXPECT().GetByName(ctx, newRuntimeName).Return(nil, usecase.ErrProductNotFound)
	s.mocks.runtimeRepo.EXPECT().Create(ctx, newRuntime).Return(nil, errors.New("create runtime error"))

	runtime, err := s.runtimeInteractor.CreateRuntime(ctx, userID, newRuntimeID, newRuntimeName, newRuntimeDescription)

	require.Error(t, err)
	require.Nil(t, runtime)
}

func TestGetByID(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	userID := "user1"
	runtimeID := "runtime-id"
	runtimeName := "runtime-name"

	expected := &entity.Product{
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

	expected := []*entity.Product{
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
