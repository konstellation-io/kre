package usecase_test

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
)

type versionSuite struct {
	ctrl              *gomock.Controller
	mocks             versionSuiteMocks
	versionInteractor *usecase.VersionInteractor
}

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
}

func newVersionSuite(t *testing.T) *versionSuite {
	ctrl := gomock.NewController(t)

	cfg := &config.Config{}
	logger := mocks.NewMockLogger(ctrl)
	versionRepo := mocks.NewMockVersionRepo(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	versionService := mocks.NewMockVersionService(ctrl)
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

	versionInteractor := usecase.NewVersionInteractor(cfg, logger, versionRepo, runtimeRepo, versionService, userActivityInteractor, accessControl, idGenerator, docGenerator, dashboardService, nodeLogRepo)

	return &versionSuite{
		ctrl: ctrl,
		mocks: versionSuiteMocks{
			cfg,
			logger,
			versionRepo,
			runtimeRepo,
			versionService,
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

	ctx := context.Background()

	userID := "user1"
	runtimeID := "run-1"

	userFound := &entity.User{
		ID:    userID,
		Email: "test@test.com",
	}

	runtime := &entity.Runtime{
		ID: runtimeID,
	}

	versionName := "price-estimator-v1"
	version := &entity.Version{
		ID:                userID,
		RuntimeID:         runtimeID,
		Name:              versionName,
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

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit)
	s.mocks.idGenerator.EXPECT().NewID().Return("fakepass").Times(4)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, runtimeID).Return(runtime, nil)
	s.mocks.versionRepo.EXPECT().GetByRuntime(runtimeID).Return([]*entity.Version{version}, nil)
	s.mocks.versionRepo.EXPECT().GetByName(ctx, runtimeID, versionName).Return(nil, usecase.ErrVersionNotFound)
	s.mocks.versionRepo.EXPECT().Create(userID, runtimeID, gomock.Any()).Return(version, nil)
	s.mocks.versionRepo.EXPECT().SetStatus(ctx, runtimeID, version.ID, entity.VersionStatusCreated).Return(nil)
	s.mocks.versionRepo.EXPECT().UploadKRTFile(runtimeID, version, gomock.Any()).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).Return(nil)

	_, statusCh, err := s.versionInteractor.Create(context.Background(), userFound.ID, runtimeID, file)
	require.Nil(t, err)

	actual := <-statusCh
	expected := version
	expected.Status = entity.VersionStatusCreated
	require.Equal(t, expected, actual)
}

func TestCreateNewVersion_FailsIfVersionNameIsDuplicated(t *testing.T) {
	s := newVersionSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	userID := "user1"
	runtimeID := "run-1"

	userFound := &entity.User{
		ID:    userID,
		Email: "test@test.com",
	}

	runtime := &entity.Runtime{
		ID: runtimeID,
	}

	versionName := "price-estimator-v1"
	version := &entity.Version{
		ID:                userID,
		RuntimeID:         runtimeID,
		Name:              versionName,
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

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit)
	s.mocks.runtimeRepo.EXPECT().GetByID(ctx, runtimeID).Return(runtime, nil)
	s.mocks.versionRepo.EXPECT().GetByRuntime(runtimeID).Return([]*entity.Version{version}, nil)
	s.mocks.versionRepo.EXPECT().GetByName(ctx, runtimeID, versionName).Return(version, nil)

	_, _, err = s.versionInteractor.Create(context.Background(), userFound.ID, runtimeID, file)
	require.Error(t, usecase.ErrVersionDuplicated, err)
}

func TestGetByName(t *testing.T) {
	s := newVersionSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	userID := "user1"
	runtimeID := "runtime-1"
	versionName := "version-name"

	expected := &entity.Version{
		ID:                "version-id",
		RuntimeID:         runtimeID,
		Name:              versionName,
		Description:       "",
		CreationDate:      time.Time{},
		CreationAuthor:    "",
		PublicationDate:   nil,
		PublicationUserID: nil,
		Status:            entity.VersionStatusCreated,
		Config:            entity.VersionConfig{},
		Entrypoint:        entity.Entrypoint{},
		Workflows:         nil,
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResVersion, auth.ActEdit).Return(nil)
	s.mocks.versionRepo.EXPECT().GetByName(ctx, runtimeID, versionName).Return(expected, nil)

	actual, err := s.versionInteractor.GetByName(ctx, userID, runtimeID, versionName)

	require.Nil(t, err)
	require.Equal(t, expected, actual)
}

func TestGetByIDs(t *testing.T) {
	s := newVersionSuite(t)
	defer s.ctrl.Finish()

	versionID := "version-id"
	runtimeID := "runtime-1"
	versionName := "version-name"

	expected := []*entity.Version{
		{
			ID:                versionID,
			RuntimeID:         runtimeID,
			Name:              versionName,
			Description:       "",
			CreationDate:      time.Time{},
			CreationAuthor:    "",
			PublicationDate:   nil,
			PublicationUserID: nil,
			Status:            entity.VersionStatusCreated,
			Config:            entity.VersionConfig{},
			Entrypoint:        entity.Entrypoint{},
			Workflows:         nil,
		},
	}

	idsToSearch := []string{runtimeID}
	s.mocks.versionRepo.EXPECT().GetByIDs(runtimeID, idsToSearch).Return(expected, nil)

	actual, err := s.versionInteractor.GetByIDs(runtimeID, idsToSearch)

	require.Nil(t, err)
	require.Equal(t, expected, actual)
}
