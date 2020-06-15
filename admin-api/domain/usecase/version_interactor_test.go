package usecase_test

import (
	"os"
	"testing"
	"time"

	"github.com/golang/mock/gomock"

	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/repository"
	"github.com/konstellation-io/kre/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
	"github.com/konstellation-io/kre/admin-api/mocks"
)

type versionSuite struct {
	ctrl              *gomock.Controller
	mocks             versionSuiteMocks
	versionInteractor *usecase.VersionInteractor
}

type versionSuiteMocks struct {
	logger            *mocks.MockLogger
	versionRepo       *mocks.MockVersionRepo
	runtimeRepo       *mocks.MockRuntimeRepo
	versionService    *mocks.MockVersionService
	monitoringService *mocks.MockMonitoringService
	userActivityRepo  *mocks.MockUserActivityRepo
	userRepo          *mocks.MockUserRepo
	createStorage     repository.CreateStorage
}

func newVersionSuite(t *testing.T) *versionSuite {
	ctrl := gomock.NewController(t)

	CreateStorageMock := func(logger logging.Logger, runtime *entity.Runtime) (repository.Storage, error) {
		m := mocks.NewMockStorage(ctrl)
		m.EXPECT().CreateBucket(gomock.Any()).Return(nil)
		m.EXPECT().CopyDir(gomock.Any(), gomock.Any()).Return(nil)
		return m, nil
	}

	logger := mocks.NewMockLogger(ctrl)
	versionRepo := mocks.NewMockVersionRepo(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	monitoringService := mocks.NewMockMonitoringService(ctrl)
	versionService := mocks.NewMockVersionService(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	createStorage := CreateStorageMock

	mocks.AddLoggerExpects(logger)

	userActivityInteractor := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		userRepo,
	)

	versionInteractor := usecase.NewVersionInteractor(
		logger,
		versionRepo,
		runtimeRepo,
		versionService,
		monitoringService,
		userActivityInteractor,
		createStorage,
	)

	return &versionSuite{
		ctrl: ctrl,
		mocks: versionSuiteMocks{
			logger:            logger,
			versionRepo:       versionRepo,
			runtimeRepo:       runtimeRepo,
			versionService:    versionService,
			monitoringService: monitoringService,
			userActivityRepo:  userActivityRepo,
			userRepo:          userRepo,
			createStorage:     createStorage,
		},
		versionInteractor: versionInteractor,
	}
}

func TestCreateNewVersion(t *testing.T) {
	s := newVersionSuite(t)
	defer s.ctrl.Finish()

	runtimeID := "run-1"

	runtime := &entity.Runtime{
		ID:           runtimeID,
		Name:         "",
		CreationDate: time.Time{},
		Owner:        "",
		Status:       "",
		Minio:        entity.MinioConfig{},
		Mongo:        entity.MongoConfig{},
	}

	userID := "user1"

	userFound := &entity.User{
		ID:    userID,
		Email: "test@test.com",
	}

	version := &entity.Version{
		ID:                userID,
		RuntimeID:         runtimeID,
		Name:              "version-1",
		Description:       "",
		CreationDate:      time.Time{},
		CreationAuthor:    "",
		PublicationDate:   nil,
		PublicationUserID: nil,
		Status:            "",
		Config:            entity.VersionConfig{},
		Entrypoint:        entity.Entrypoint{},
		Workflows:         nil,
	}

	file, err := os.Open("../../test_assets/price-estimator-v1.krt")
	if err != nil {
		t.Error(err)
	}

	s.mocks.runtimeRepo.EXPECT().GetByID(runtimeID).Return(runtime, nil)
	s.mocks.versionRepo.EXPECT().GetByRuntime(runtimeID).Return([]*entity.Version{version}, nil)
	s.mocks.versionRepo.EXPECT().Create(userID, gomock.Any()).Return(version, nil)

	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).Return(nil)

	_, err = s.versionInteractor.Create(userFound.ID, runtimeID, file)
	require.Nil(t, err)

}
