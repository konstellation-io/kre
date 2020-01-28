package usecase_test

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/mocks"
	"testing"
)

type VersionSuite struct {
	suite.Suite
	mocks      VersionSuiteMocks
	interactor *usecase.VersionInteractor
}

type VersionSuiteMocks struct {
	logger           *mocks.Logger
	resourceManager  *mocks.ResourceManagerService
	logStreamService *mocks.LogStreamService
}

func TestVersionSuite(t *testing.T) {
	suite.Run(t, new(VersionSuite))
}

func (s *VersionSuite) SetupTest() {

	s.mocks = VersionSuiteMocks{
		logger:           new(mocks.Logger),
		resourceManager:  new(mocks.ResourceManagerService),
		logStreamService: new(mocks.LogStreamService),
	}

	s.mocks.logger.On("Info", mock.Anything).Return()

	s.interactor = usecase.NewVersionInteractor(
		s.mocks.logger,
		s.mocks.resourceManager,
		s.mocks.logStreamService,
	)
}

func (s *VersionSuite) TestDeployVersion() {
	t := s.T()

	name := "test-version"

	s.mocks.resourceManager.On("DeployVersion", name).Return(nil)
	version := &entity.Version{
		Name: name,
		Entrypoint: entity.Entrypoint{
			Config: map[string]interface{}{
				"nats-subjects": map[string]string{},
			},
		},
		Workflows: nil,
	}
	s.mocks.resourceManager.On("CreateEntrypoint", version).Return(nil)

	versionName := "test-version-global"
	s.mocks.resourceManager.On("CreateVersionConfig", version).Return(versionName, nil)
	actual, err := s.interactor.DeployVersion(version)
	version.Status = string(usecase.VersionStatusCreating)

	require.Nil(t, err)
	assert.EqualValues(t, actual, version)
}

func (s *VersionSuite) TestActivateVersion() {
	t := s.T()

	name := "test-version"

	versionActivated := &entity.Version{
		Name:   name,
		Status: string(usecase.VersionStatusRunning),
	}

	s.mocks.resourceManager.On("ActivateVersion", name).Return(nil)

	res, err := s.interactor.ActivateVersion(name)
	require.Nil(t, err)
	require.EqualValues(t, res, versionActivated)
}
