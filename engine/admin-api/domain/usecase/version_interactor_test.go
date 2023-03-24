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
	userRepo         *mocks.MockUserRepo
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
func (suite *VersionInteractorSuite) SetupSuite() {
	ctrl := gomock.NewController(suite.T())

	cfg := &config.Config{}
	logger := mocks.NewMockLogger(ctrl)
	versionRepo := mocks.NewMockVersionRepo(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	versionService := mocks.NewMockVersionService(ctrl)
	natsManagerService := mocks.NewMockNatsManagerService(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)
	idGenerator := mocks.NewMockIDGenerator(ctrl)
	docGenerator := mocks.NewMockDocGenerator(ctrl)
	dashboardService := mocks.NewMockDashboardService(ctrl)
	nodeLogRepo := mocks.NewMockNodeLogRepository(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivityInteractor := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		userRepo,
		accessControl,
	)

	versionInteractor := usecase.NewVersionInteractor(
		cfg, logger, versionRepo, runtimeRepo, versionService, natsManagerService,
		userActivityInteractor, accessControl, idGenerator, docGenerator, dashboardService, nodeLogRepo)

	suite.ctrl = ctrl
	suite.mocks = versionSuiteMocks{
		cfg,
		logger,
		versionRepo,
		runtimeRepo,
		versionService,
		userActivityRepo,
		userRepo,
		accessControl,
		idGenerator,
		dashboardService,
	}
	suite.versionInteractor = versionInteractor
	suite.ctx = context.Background()
}

// TearDownSuite finish controller.
func (suite *VersionInteractorSuite) TearDownSuite() {
	suite.ctrl.Finish()
}

func (suite *VersionInteractorSuite) TestCreateNewVersion() {
	userID := "user1"
	runtimeID := "run-1"

	userFound := &entity.User{
		ID:    userID,
		Email: "test@test.com",
	}

	runtime := &entity.Runtime{
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
	suite.Require().NoError(err)

	suite.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit)
	suite.mocks.idGenerator.EXPECT().NewID().Return("fakepass").Times(6)
	suite.mocks.runtimeRepo.EXPECT().GetByID(suite.ctx, runtimeID).Return(runtime, nil)
	suite.mocks.versionRepo.EXPECT().GetByRuntime(runtimeID).Return([]*entity.Version{version}, nil)
	suite.mocks.versionRepo.EXPECT().GetByName(suite.ctx, runtimeID, versionName).Return(nil, usecase.ErrVersionNotFound)
	suite.mocks.versionRepo.EXPECT().Create(userID, runtimeID, gomock.Any()).Return(version, nil)
	suite.mocks.versionRepo.EXPECT().SetStatus(suite.ctx, runtimeID, version.ID, entity.VersionStatusCreated).Return(nil)
	suite.mocks.versionRepo.EXPECT().UploadKRTFile(runtimeID, version, gomock.Any()).Return(nil)
	suite.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).Return(nil)
	suite.mocks.dashboardService.EXPECT().Create(suite.ctx, runtimeID, gomock.Any(), gomock.Any()).Return(nil)

	_, statusCh, err := suite.versionInteractor.Create(context.Background(), userFound.ID, runtimeID, file)
	suite.Require().NoError(err)

	actual := <-statusCh
	expected := version
	expected.Status = entity.VersionStatusCreated
	suite.Equal(expected, actual)
}

func (suite *VersionInteractorSuite) TestCreateNewVersion_FailsIfVersionNameIsDuplicated() {
	userID := "user1"
	runtimeID := "run-1"

	userFound := &entity.User{
		ID:    userID,
		Email: "test@test.com",
	}

	runtime := &entity.Runtime{
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
	suite.Require().NoError(err)

	suite.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit)
	suite.mocks.runtimeRepo.EXPECT().GetByID(suite.ctx, runtimeID).Return(runtime, nil)
	suite.mocks.versionRepo.EXPECT().GetByRuntime(runtimeID).Return([]*entity.Version{version}, nil)
	suite.mocks.versionRepo.EXPECT().GetByName(suite.ctx, runtimeID, versionName).Return(version, nil)

	_, _, err = suite.versionInteractor.Create(context.Background(), userFound.ID, runtimeID, file)
	suite.ErrorIs(err, usecase.ErrVersionDuplicated)
}

func (suite *VersionInteractorSuite) TestGetByName() {
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

	suite.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit).Return(nil)
	suite.mocks.versionRepo.EXPECT().GetByName(suite.ctx, runtimeID, versionName).Return(expected, nil)

	actual, err := suite.versionInteractor.GetByName(suite.ctx, userID, runtimeID, versionName)
	suite.Require().NoError(err)

	suite.Equal(expected, actual)
}
