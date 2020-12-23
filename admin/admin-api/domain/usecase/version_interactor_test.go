package usecase_test

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/admin/admin-api/mocks"
)

type versionSuite struct {
	ctrl              *gomock.Controller
	mocks             versionSuiteMocks
	versionInteractor *usecase.VersionInteractor
}

type versionSuiteMocks struct {
	cfg               *config.Config
	logger            *mocks.MockLogger
	versionRepo       *mocks.MockVersionRepo
	runtimeRepo       *mocks.MockRuntimeRepo
	versionService    *mocks.MockVersionService
	monitoringService *mocks.MockMonitoringService
	userActivityRepo  *mocks.MockUserActivityRepo
	userRepo          *mocks.MockUserRepo
	accessControl     *mocks.MockAccessControl
	idGenerator       *mocks.MockIDGenerator
}

func newVersionSuite(t *testing.T) *versionSuite {
	ctrl := gomock.NewController(t)

	cfg := &config.Config{}
	logger := mocks.NewMockLogger(ctrl)
	versionRepo := mocks.NewMockVersionRepo(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	monitoringService := mocks.NewMockMonitoringService(ctrl)
	versionService := mocks.NewMockVersionService(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)
	idGenerator := mocks.NewMockIDGenerator(ctrl)
	docGenerator := mocks.NewMockDocGenerator(ctrl)
	dashboardService := mocks.NewMockDashboardService(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivityInteractor := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		userRepo,
		accessControl,
	)

	versionInteractor := usecase.NewVersionInteractor(
		cfg,
		logger,
		versionRepo,
		runtimeRepo,
		versionService,
		monitoringService,
		userActivityInteractor,
		accessControl,
		idGenerator,
		docGenerator,
		dashboardService,
	)

	return &versionSuite{
		ctrl: ctrl,
		mocks: versionSuiteMocks{
			cfg,
			logger,
			versionRepo,
			runtimeRepo,
			versionService,
			monitoringService,
			userActivityRepo,
			userRepo,
			accessControl,
			idGenerator,
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

	ctx := context.Background()

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit)
	s.mocks.idGenerator.EXPECT().NewID().Return("fakepass").Times(4)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, runtimeID).Return(runtime, nil)
	s.mocks.versionRepo.EXPECT().GetByRuntime(runtimeID).Return([]*entity.Version{version}, nil)
	s.mocks.versionRepo.EXPECT().Create(userID, gomock.Any()).Return(version, nil)
	s.mocks.versionRepo.EXPECT().SetStatus(gomock.Any(), version.ID, entity.VersionStatusCreated).Return(nil)
	s.mocks.versionRepo.EXPECT().UploadKRTFile(version, gomock.Any()).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).Return(nil)

	_, statusCh, err := s.versionInteractor.Create(context.Background(), userFound.ID, runtimeID, file)
	require.Nil(t, err)

	actual := <-statusCh
	expected := version
	expected.Status = entity.VersionStatusCreated
	require.Equal(t, expected, actual)
}
