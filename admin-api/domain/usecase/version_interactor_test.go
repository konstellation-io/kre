package usecase_test

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/mocks"
)

type VersionSuite struct {
	suite.Suite
	mocks                  VersionSuiteMocks
	versionInteractor      *usecase.VersionInteractor
	userActivityInteractor *usecase.UserActivityInteractor
}

type VersionSuiteMocks struct {
	logger            *mocks.Logger
	versionRepo       *mocks.VersionRepo
	runtimeRepo       *mocks.RuntimeRepo
	versionService    *mocks.VersionService
	monitoringService *mocks.MonitoringService
	userActivityRepo  *mocks.UserActivityRepo
	userRepo          *mocks.UserRepo
	createStorage     repository.CreateStorage
}

func TestVersionSuite(t *testing.T) {
	suite.Run(t, new(VersionSuite))
}

func (s *VersionSuite) SetupTest() {
	CreateStorageMock := func(logger logging.Logger, runtime *entity.Runtime) (repository.Storage, error) {
		m := new(mocks.Storage)
		m.On("CreateBucket", mock.Anything).Return(nil)
		m.On("CopyDir", mock.Anything, mock.Anything).Return(nil)
		return m, nil
	}

	s.mocks = VersionSuiteMocks{
		logger:            new(mocks.Logger),
		versionRepo:       new(mocks.VersionRepo),
		runtimeRepo:       new(mocks.RuntimeRepo),
		monitoringService: new(mocks.MonitoringService),
		versionService:    new(mocks.VersionService),
		userActivityRepo:  new(mocks.UserActivityRepo),
		userRepo:          new(mocks.UserRepo),
		createStorage:     CreateStorageMock,
	}

	// FIXME use another mock lib: https://gitlab.com/konstellation/kre/issues/198
	s.mocks.logger.On("Info", mock.Anything).Return()
	s.mocks.logger.On("Warn", mock.Anything).Return()
	s.mocks.logger.On("Error", mock.Anything).Return()
	s.mocks.logger.On("Infof", mock.Anything).Return()
	s.mocks.logger.On("Infof", mock.Anything, mock.Anything).Return()
	s.mocks.logger.On("Warnf", mock.Anything).Return()
	s.mocks.logger.On("Errorf", mock.Anything).Return()

	s.userActivityInteractor = usecase.NewUserActivityInteractor(

		s.mocks.logger,
		s.mocks.userActivityRepo,
		s.mocks.userRepo,
	)

	s.versionInteractor = usecase.NewVersionInteractor(
		s.mocks.logger,
		s.mocks.versionRepo,
		s.mocks.runtimeRepo,
		s.mocks.versionService,
		s.mocks.monitoringService,
		s.userActivityInteractor,
		s.mocks.createStorage,
	)
}

func (s *VersionSuite) TestCreateNewVersion() {
	t := s.T()

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

	s.mocks.userRepo.On("GetByID", userID).Return(userFound, nil)
	s.mocks.runtimeRepo.On("GetByID", runtimeID).Return(runtime, nil)
	s.mocks.versionRepo.On("GetByRuntime", runtimeID).Return([]*entity.Version{version}, nil)
	s.mocks.versionRepo.On("Create", userID, mock.Anything).Return(version, nil)

	s.mocks.userActivityRepo.On("Create", mock.Anything).Return(nil)

	_, err = s.versionInteractor.Create(userFound.ID, runtimeID, file)
	require.Nil(t, err)

}
