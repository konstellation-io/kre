package version

import (
	"context"
	"errors"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"k8s.io/client-go/kubernetes"

	"gitlab.com/konstellation/kre/k8s-manager/config"
	"gitlab.com/konstellation/kre/k8s-manager/entity"
)

var (
	// ErrCreation error
	ErrCreation = errors.New("error creating a version resource")
	// ErrUnexpected error
	ErrUnexpected = errors.New("unexpected error creating version")
)

type Manager struct {
	config    *config.Config
	logger    *simplelogger.SimpleLogger
	clientset *kubernetes.Clientset
}

func New(config *config.Config, logger *simplelogger.SimpleLogger, clientset *kubernetes.Clientset) *Manager {
	return &Manager{
		config,
		logger,
		clientset,
	}
}

type Config struct {
	Entrypoint EntrypointConfig
	Workflows  map[string]WorkflowConfig
}

// Start calls kubernetes to create a new Version Object
func (m *Manager) Start(version *entity.Version) error {
	m.logger.Infof("Starting version: %s", version.Name)

	versionConfig := Config{
		Entrypoint: EntrypointConfig{},
		Workflows:  map[string]WorkflowConfig{},
	}
	for _, w := range version.Workflows {
		m.logger.Infof("Processing workflow %s", w.Name)
		versionConfig.Workflows[w.Name] = m.generateNodeConfig(version, w)
		for _, n := range w.Nodes {
			nodeConfig := versionConfig.Workflows[w.Name][n.Id]
			err := m.createNode(version, n, nodeConfig)
			if err != nil {
				m.logger.Error(err.Error())
				return err
			}
		}
	}

	econf := m.generateEntrypointConfig(version, versionConfig.Workflows)

	_, err := m.createConfig(version, econf)
	if err != nil {
		return err
	}

	err = m.createEntrypoint(version)
	if err != nil {
		m.logger.Error(err.Error())
		return err
	}

	return nil
}

// Stop calls kubernetes remove all version resources
func (m *Manager) Stop(ctx context.Context, version *entity.Version) error {
	err := m.deleteConfigMapsSync(ctx, version)
	if err != nil {
		return err
	}

	return m.deleteDeploymentsSync(ctx, version)
}

// Publish calls kubernetes to create a new Version Object
func (m *Manager) Publish(version *entity.Version) error {
	m.logger.Infof("Publish version %s", version.Name)
	_, err := m.createEntrypointService(version)

	return err
}

func (m *Manager) Unpublish(version *entity.Version) error {
	m.logger.Infof("Deactivating version '%s'", version.Name)
	return m.deleteEntrypointService(version)
}

// UpdateConfig calls kubernetes to create a new Version Object
func (m *Manager) UpdateConfig(version *entity.Version) error {
	_, err := m.updateConfigMap(version)
	if err != nil {
		return err
	}

	return m.restartPodsSync(version)
}
