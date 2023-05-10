package usecase_test

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/suite"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
)

type versionSuiteMocks struct {
	cfg              *config.Config
	logger           *mocks.MockLogger
	versionRepo      *mocks.MockVersionRepo
	runtimeRepo      *mocks.MockRuntimeRepo
	versionService   *mocks.MockVersionService
	userActivityRepo *mocks.MockUserActivityRepo
	accessControl    *mocks.MockAccessControl
	idGenerator      *mocks.MockIDGenerator
	dashboardService *mocks.MockDashboardService
}

type VersionInteractorSuite struct {
	suite.Suite
	ctrl              *gomock.Controller
	mocks             versionSuiteMocks
	versionInteractor *usecase.VersionInteractor
	ctx               context.Context
}

func TestVersionInteractorSuite(t *testing.T) {
	suite.Run(t, new(VersionInteractorSuite))
}

// SetupSuite will create a mock controller and will initialize all required mock interfaces.
func (s *VersionInteractorSuite) SetupSuite() {
	ctrl := gomock.NewController(s.T())

	cfg := &config.Config{}
	logger := mocks.NewMockLogger(ctrl)
	versionRepo := mocks.NewMockVersionRepo(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	versionService := mocks.NewMockVersionService(ctrl)
	natsManagerService := mocks.NewMockNatsManagerService(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)
	idGenerator := mocks.NewMockIDGenerator(ctrl)
	docGenerator := mocks.NewMockDocGenerator(ctrl)
	dashboardService := mocks.NewMockDashboardService(ctrl)
	nodeLogRepo := mocks.NewMockNodeLogRepository(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivityInteractor := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		accessControl,
	)

	versionInteractor := usecase.NewVersionInteractor(
		cfg, logger, versionRepo, runtimeRepo, versionService, natsManagerService,
		userActivityInteractor, accessControl, idGenerator, docGenerator, dashboardService, nodeLogRepo)

	s.ctrl = ctrl
	s.mocks = versionSuiteMocks{
		cfg,
		logger,
		versionRepo,
		runtimeRepo,
		versionService,
		userActivityRepo,
		accessControl,
		idGenerator,
		dashboardService,
	}
	s.versionInteractor = versionInteractor
	s.ctx = context.Background()
}

// TearDownSuite finish controller.
func (s *VersionInteractorSuite) TearDownSuite() {
	s.ctrl.Finish()
}

func (s *VersionInteractorSuite) TestCreateNewVersion() {
	userID := "user1"
	runtimeID := "run-1"

	userFound := &entity.User{
		ID:    userID,
		Email: "test@test.com",
	}

	runtime := &entity.Product{
		ID: runtimeID,
	}

	versionName := "classificator-v1"
	version := &entity.Version{
		ID:                userID,
		Name:              versionName,
		KrtVersion:        "v2",
		Description:       "",
		CreationDate:      time.Time{},
		CreationAuthor:    "",
		PublicationDate:   nil,
		PublicationUserID: nil,
		Status:            "",
		Config:            entity.VersionUserConfig{},
		Entrypoint:        entity.Entrypoint{},
		Workflows:         nil,
	}

	file, err := os.Open("../../test_assets/classificator-v1.krt")
	s.Require().NoError(err)

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit)
	s.mocks.idGenerator.EXPECT().NewID().Return("fakepass").Times(6)
	s.mocks.runtimeRepo.EXPECT().GetByID(s.ctx, runtimeID).Return(runtime, nil)
	s.mocks.versionRepo.EXPECT().GetByRuntime(runtimeID).Return([]*entity.Version{version}, nil)
	s.mocks.versionRepo.EXPECT().GetByName(s.ctx, runtimeID, versionName).Return(nil, usecase.ErrVersionNotFound)
	s.mocks.versionRepo.EXPECT().Create(userID, runtimeID, gomock.Any()).Return(version, nil)
	s.mocks.versionRepo.EXPECT().SetStatus(s.ctx, runtimeID, version.ID, entity.VersionStatusCreated).Return(nil)
	s.mocks.versionRepo.EXPECT().UploadKRTFile(runtimeID, version, gomock.Any()).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).Return(nil)
	s.mocks.dashboardService.EXPECT().Create(s.ctx, runtimeID, gomock.Any(), gomock.Any()).Return(nil)

	_, statusCh, err := s.versionInteractor.Create(context.Background(), userID, runtimeID, file)
	s.Require().NoError(err)

	actual := <-statusCh
	expected := version
	expected.Status = entity.VersionStatusCreated
	s.Equal(expected, actual)
}

func (s *VersionInteractorSuite) TestCreateNewVersion_FailsIfVersionNameIsDuplicated() {
	userID := "user1"
	runtimeID := "run-1"

	userFound := &entity.User{
		ID:    userID,
		Email: "test@test.com",
	}

	runtime := &entity.Product{
		ID: runtimeID,
	}

	versionName := "classificator-v1"
	version := &entity.Version{
		ID:                userID,
		Name:              versionName,
		Description:       "",
		CreationDate:      time.Time{},
		CreationAuthor:    "",
		PublicationDate:   nil,
		PublicationUserID: nil,
		Status:            "",
		Config:            entity.VersionUserConfig{},
		Entrypoint:        entity.Entrypoint{},
		Workflows:         nil,
	}

	file, err := os.Open("../../test_assets/classificator-v1.krt")
	s.Require().NoError(err)

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit)
	s.mocks.runtimeRepo.EXPECT().GetByID(s.ctx, runtimeID).Return(runtime, nil)
	s.mocks.versionRepo.EXPECT().GetByRuntime(runtimeID).Return([]*entity.Version{version}, nil)
	s.mocks.versionRepo.EXPECT().GetByName(s.ctx, runtimeID, versionName).Return(version, nil)

	_, _, err = s.versionInteractor.Create(context.Background(), userID, runtimeID, file)
	s.ErrorIs(err, usecase.ErrVersionDuplicated)
}

func (s *VersionInteractorSuite) TestGetByName() {
	userID := "user1"
	runtimeID := "runtime-1"
	versionName := "version-name"

	expected := &entity.Version{
		ID:                "version-id",
		Name:              versionName,
		Description:       "",
		CreationDate:      time.Time{},
		CreationAuthor:    "",
		PublicationDate:   nil,
		PublicationUserID: nil,
		Status:            entity.VersionStatusCreated,
		Config:            entity.VersionUserConfig{},
		Entrypoint:        entity.Entrypoint{},
		Workflows:         nil,
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit).Return(nil)
	s.mocks.versionRepo.EXPECT().GetByName(s.ctx, runtimeID, versionName).Return(expected, nil)

	actual, err := s.versionInteractor.GetByName(s.ctx, userID, runtimeID, versionName)
	s.Require().NoError(err)

	s.Equal(expected, actual)
}
