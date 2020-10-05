package usecase_test

import (
	"context"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/repository/minio"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin/admin-api/mocks"
	"github.com/stretchr/testify/assert"
)

type versionDashboardsSuite struct {
	ctrl              *gomock.Controller
	versionInteractor *usecase.VersionInteractor
	runtime           *entity.Runtime
	mocks             versionDashboardsSuiteMocks
}

type versionDashboardsSuiteMocks struct {
	logger           *mocks.MockLogger
	dashboardService *mocks.MockDashboardService
}

func newVersionDashboardsSuite(t *testing.T) *versionDashboardsSuite {
	ctrl := gomock.NewController(t)

	cfg := &config.Config{}
	logger := mocks.NewMockLogger(ctrl)
	dashboardService := mocks.NewMockDashboardService(ctrl)
	versionRepo := mocks.NewMockVersionRepo(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	versionService := mocks.NewMockVersionService(ctrl)
	monitoringService := mocks.NewMockMonitoringService(ctrl)
	userActivityInteractor := mocks.NewMockUserActivityInteracter(ctrl)
	createStorage := minio.CreateStorage
	accessControl := mocks.NewMockAccessControl(ctrl)
	idGenerator := mocks.NewMockIDGenerator(ctrl)
	docGenerator := mocks.NewMockDocGenerator(ctrl)

	mocks.AddLoggerExpects(logger)

	versionInteractor := usecase.NewVersionInteractor(
		cfg,
		logger,
		versionRepo,
		runtimeRepo,
		versionService,
		monitoringService,
		userActivityInteractor,
		createStorage,
		accessControl,
		idGenerator,
		docGenerator,
		dashboardService,
	)

	runtime := &entity.Runtime{Name: "test"}
	return &versionDashboardsSuite{ctrl: ctrl,
		versionInteractor: versionInteractor,
		runtime:           runtime,
		mocks: versionDashboardsSuiteMocks{
			logger:           logger,
			dashboardService: dashboardService,
		},
	}
}

func TestStoreDashboard(t *testing.T) {
	s := newVersionDashboardsSuite(t)
	defer s.ctrl.Finish()

	version := "test"
	dashboardsFolder := "../../test_assets/dashboards"

	s.mocks.dashboardService.EXPECT().Create(context.Background(), s.runtime, version, gomock.Any()).Return(nil)

	err := s.versionInteractor.StoreDashboards(context.Background(), s.runtime, dashboardsFolder, version)
	assert.Nil(t, err)
}
