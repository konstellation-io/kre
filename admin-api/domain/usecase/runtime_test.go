package usecase_test

import (
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/mocks"
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
}

func newRuntimeSuite(t *testing.T) *runtimeSuite {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	runtimeService := mocks.NewMockRuntimeService(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	passwordGenerator := mocks.NewMockPasswordGenerator(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivity := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		userRepo,
	)

	runtimeInteractor := usecase.NewRuntimeInteractor(
		logger,
		runtimeRepo,
		runtimeService,
		userActivity,
		passwordGenerator,
	)

	return &runtimeSuite{
		ctrl:              ctrl,
		runtimeInteractor: runtimeInteractor,
		mocks: &runtimeSuiteMocks{
			logger:            logger,
			runtimeService:    runtimeService,
			runtimeRepo:       runtimeRepo,
			userActivityRepo:  userActivityRepo,
			userRepo:          userRepo,
			passwordGenerator: passwordGenerator,
		},
	}
}

func TestCreateRuntime(t *testing.T) {
	s := newRuntimeSuite(t)
	defer s.ctrl.Finish()

	name := "runtimeTest1"
	description := "runtimeDescriptionTest1"
	userID := "userTest1"

	fakePass := "t3st"

	runtimeBeforeCreation := &entity.Runtime{
		Name:        name,
		Description: description,
		Owner:       userID,
		Mongo: entity.MongoConfig{
			Username:  "admin",
			Password:  fakePass,
			SharedKey: fakePass,
		},
		Minio: entity.MinioConfig{
			AccessKey: "admin",
			SecretKey: fakePass,
		},
	}
	expectedRuntime := &entity.Runtime{
		ID:          "runtime1",
		Name:        name,
		Description: description,
		Owner:       userID,
		Mongo: entity.MongoConfig{
			Username:  "admin",
			Password:  fakePass,
			SharedKey: fakePass,
		},
		Minio: entity.MinioConfig{
			AccessKey: "admin",
			SecretKey: fakePass,
		},
	}
	updatedRuntime := &entity.Runtime{
		ID:          "runtime1",
		Name:        name,
		Description: description,
		Owner:       userID,
		Status:      string(usecase.RuntimeStatusStarted),
		Mongo: entity.MongoConfig{
			Username:  "admin",
			Password:  fakePass,
			SharedKey: fakePass,
		},
		Minio: entity.MinioConfig{
			AccessKey: "admin",
			SecretKey: fakePass,
		},
	}

	s.mocks.runtimeService.EXPECT().Create(runtimeBeforeCreation).Return("OK", nil)
	s.mocks.passwordGenerator.EXPECT().NewPassword().Return(fakePass).Times(3)
	s.mocks.runtimeRepo.EXPECT().Create(runtimeBeforeCreation).Return(expectedRuntime, nil)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).Return(nil)

	s.mocks.runtimeService.EXPECT().WaitForRuntimeStarted(expectedRuntime).Return(nil, nil)
	s.mocks.runtimeRepo.EXPECT().Update(updatedRuntime).Return(nil)

	runtime, createdRuntimeChannel, err := s.runtimeInteractor.CreateRuntime(name, description, userID)
	require.Nil(t, err)
	require.Equal(t, expectedRuntime, runtime)

	r := <-createdRuntimeChannel
	require.Equal(t, updatedRuntime, r)
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
	s.mocks.runtimeRepo.EXPECT().FindAll().Return(expectedRuntimes, nil)
	runtimes, err := s.runtimeInteractor.FindAll()
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
	s.mocks.runtimeRepo.EXPECT().GetByID(runtimeID).Return(expectedRuntime, nil)
	runtime, err := s.runtimeInteractor.GetByID(runtimeID)
	require.Nil(t, err)
	require.Equal(t, expectedRuntime, runtime)
}
