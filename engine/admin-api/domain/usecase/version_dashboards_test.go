package usecase

import (
	"context"
	"fmt"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
	"github.com/stretchr/testify/assert"
)

type versionDashboardsSuite struct {
	ctrl              *gomock.Controller
	versionInteractor *VersionInteractor
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
	userActivityInteractor := mocks.NewMockUserActivityInteracter(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)
	idGenerator := mocks.NewMockIDGenerator(ctrl)
	docGenerator := mocks.NewMockDocGenerator(ctrl)
	nodeLogRepo := mocks.NewMockNodeLogRepository(ctrl)

	mocks.AddLoggerExpects(logger)

	versionInteractor := NewVersionInteractor(cfg, logger, versionRepo, runtimeRepo, versionService, userActivityInteractor, accessControl, idGenerator, docGenerator, dashboardService, nodeLogRepo)

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
	dashboardPath := fmt.Sprintf("%s/models.json", dashboardsFolder)
	s.mocks.dashboardService.EXPECT().Create(context.Background(), s.runtime, version, dashboardPath).Return(nil)

	err := s.versionInteractor.storeDashboards(context.Background(), s.runtime, dashboardsFolder, version)
	assert.Nil(t, err)
}

func TestStoreDashboardWrongFolderPath(t *testing.T) {
	s := newVersionDashboardsSuite(t)
	defer s.ctrl.Finish()

	version := "test"
	dashboardsFolder := "../../test_assets/dashboard"

	err := s.versionInteractor.storeDashboards(context.Background(), s.runtime, dashboardsFolder, version)
	assert.NotNil(t, err)
	assert.Contains(t, err[0].Error(), "error listing dashboards files: open ../../test_assets/dashboard: no such file or directory")
}
