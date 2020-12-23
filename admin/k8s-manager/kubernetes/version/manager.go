package version

import (
	"context"
	"fmt"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"

	"github.com/konstellation-io/kre/admin/k8s-manager/config"
	"github.com/konstellation-io/kre/admin/k8s-manager/entity"
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

// Stop calls kubernetes remove all version resources.
func (m *Manager) Stop(ctx context.Context, version *entity.Version) error {
	err := m.deleteConfigMapsSync(ctx, version)
	if err != nil {
		return err
	}

	return m.deleteDeploymentsSync(ctx, version)
}

// Publish calls kubernetes to create a new Version Object.
func (m *Manager) Publish(version *entity.Version) error {
	m.logger.Infof("Publish version %s", version.Name)
	_, err := m.createEntrypointService(version)

	return err
}

// Stop calls kubernetes remove access to this version.
func (m *Manager) Unpublish(version *entity.Version) error {
	m.logger.Infof("Deactivating version '%s'", version.Name)
	return m.deleteEntrypointService(version)
}

// UpdateConfig calls kubernetes to update a version config.
func (m *Manager) UpdateConfig(ctx context.Context, version *entity.Version) error {
	_, err := m.updateConfigMap(version)
	if err != nil {
		return err
	}

	return m.restartPodsSync(ctx, version)
}

func (m *Manager) WaitForVersionPods(ctx context.Context, version *entity.Version) error {
	ns := version.Namespace
	m.logger.Debugf("[WaitForVersionPods] watching ns '%s' for version '%s'", ns, version.Name)

	nodes := []string{"entrypoint"}
	for _, w := range version.Workflows {
		for _, n := range w.Nodes {
			nodes = append(nodes, n.Id)
		}
	}

	labelSelector := fmt.Sprintf("version-name=%s,type in (node, entrypoint)", version.Name)
	waitCh := make(chan struct{}, 1)
	resolver := NewStatusResolver(m.logger, nodes, waitCh)

	stopCh := m.watchResources(ns, labelSelector, cache.ResourceEventHandlerFuncs{
		AddFunc:    resolver.onAdd,
		UpdateFunc: resolver.onUpdate,
		DeleteFunc: resolver.onDelete,
	})
	defer close(stopCh) // The k8s informer opened in WatchNodeStatus will be stopped when stopCh is closed.

	for {
		select {
		case <-ctx.Done():
			m.logger.Infof("[WaitForVersionPods] context cancelled. stop waiting.")
			return nil

		case <-time.After(10 * time.Minute):
			return fmt.Errorf("[WaitForVersionPods] timeout waiting for version pods")

		case <-waitCh:
			m.logger.Debugf("[WaitForVersionPods] all version pods for '%s' are running", version.Name)
			return nil
		}
	}
}

func (m *Manager) watchResources(ns, labelSelector string, handlers cache.ResourceEventHandler) chan struct{} {
	stopCh := make(chan struct{})

	go func() {
		m.logger.Debugf("Starting informer with labelSelector: %s ", labelSelector)

		factory := informers.NewSharedInformerFactoryWithOptions(m.clientset, 0,
			informers.WithNamespace(ns),
			informers.WithTweakListOptions(func(options *metav1.ListOptions) {
				options.LabelSelector = labelSelector
			}))

		informer := factory.Core().V1().Pods().Informer()
		informer.AddEventHandler(handlers)
		informer.Run(stopCh)
	}()

	return stopCh
}
