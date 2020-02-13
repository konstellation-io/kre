package usecase_test

import (
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/repository/minio"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/mocks"
	"os"
	"testing"
	"time"
)

type VersionSuite struct {
	suite.Suite
	mocks                  VersionSuiteMocks
	versionInteractor      *usecase.VersionInteractor
	userActivityInteractor *usecase.UserActivityInteractor
}

type VersionSuiteMocks struct {
	logger           *mocks.Logger
	versionRepo      *mocks.VersionRepo
	runtimeRepo      *mocks.RuntimeRepo
	runtimeService   *mocks.RuntimeService
	userActivityRepo *mocks.UserActivityRepo
	userRepo         *mocks.UserRepo
	minioRepo        *mocks.MinioRepo
}

func TestVersionSuite(t *testing.T) {
	suite.Run(t, new(VersionSuite))
}

func (s *VersionSuite) SetupTest() {
	s.mocks = VersionSuiteMocks{
		logger:           new(mocks.Logger),
		versionRepo:      new(mocks.VersionRepo),
		runtimeRepo:      new(mocks.RuntimeRepo),
		runtimeService:   new(mocks.RuntimeService),
		userActivityRepo: new(mocks.UserActivityRepo),
		userRepo:         new(mocks.UserRepo),
		minioRepo:        new(mocks.MinioRepo),
	}

	s.mocks.logger.On("Info", mock.Anything).Return()
	s.mocks.logger.On("Warn", mock.Anything).Return()

	s.userActivityInteractor = usecase.NewUserActivityInteractor(
		s.mocks.logger,
		s.mocks.userActivityRepo,
		s.mocks.userRepo,
	)

	s.versionInteractor = usecase.NewVersionInteractor(
		s.mocks.logger,
		s.mocks.versionRepo,
		s.mocks.runtimeRepo,
		s.mocks.runtimeService,
		s.userActivityInteractor,
		s.mocks.minioRepo,
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

	version := entity.Version{
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
	s.mocks.versionRepo.On("GetByRuntime", runtimeID).Return([]entity.Version{version}, nil)
	s.mocks.versionRepo.On("Create", userID, mock.Anything).Return(&version, nil)

	minioClient := &minio.MinioClient{}
	mockBucket := mocks.Bucket{}
	mockBucket.On("CopyDir", mock.Anything, minioClient).Return(nil)

	s.mocks.minioRepo.On("NewClient", s.mocks.logger, runtime).Return(minioClient, nil)
	s.mocks.minioRepo.On("CreateBucket", mock.Anything, minioClient).Return(&mockBucket, nil)

	s.mocks.userActivityRepo.On("Create", mock.Anything).Return(nil)

	_, err = s.versionInteractor.Create(userFound.ID, runtimeID, file)
	require.Nil(t, err)

}
