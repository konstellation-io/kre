package version

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/konstellation-io/kre/engine/k8s-manager/proto/versionpb"

	"github.com/konstellation-io/kre/libs/simplelogger"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"

	"github.com/konstellation-io/kre/engine/k8s-manager/config"
)

type Manager struct {
	config    *config.Config
	logger    *simplelogger.SimpleLogger
	clientset *kubernetes.Clientset
}

const timeoutWaitingForVersionPODS = 10 * time.Minute

var ErrWaitingForVersionPODSTimeout = errors.New("[WaitForVersionPods] timeout waiting for version pods")

func New(cfg *config.Config, logger *simplelogger.SimpleLogger, clientset *kubernetes.Clientset) *Manager {
	return &Manager{
		cfg,
		logger,
		clientset,
	}
}

// Start request k8s to create all version resources like deployments and config maps associated with the version.
func (m *Manager) Start(req *versionpb.StartRequest) error {
	m.logger.Infof("Starting version \"%s\"", req.VersionName)

	err := m.createVersionConfFiles(req.VersionName, m.config.Kubernetes.Namespace, req.Workflows)
	if err != nil {
		return err
	}

	err = m.createAllNodeDeployments(req)
	if err != nil {
		return err
	}

	return m.createEntrypoint(req)
}

// Stop calls kubernetes remove all version resources.
func (m *Manager) Stop(ctx context.Context, req *versionpb.VersionName) error {
	err := m.deleteConfigMapsSync(ctx, req.Name, m.config.Kubernetes.Namespace)
	if err != nil {
		return err
	}

	return m.deleteDeploymentsSync(ctx, req.Name, m.config.Kubernetes.Namespace)
}

// Publish calls kubernetes to create a new Version Object.
func (m *Manager) Publish(req *versionpb.VersionName) error {
	m.logger.Infof("Publish version %s", req.Name)
	_, err := m.createEntrypointService(req.Name, m.config.Kubernetes.Namespace)

	return err
}

// Unpublish calls kubernetes remove access to this version.
func (m *Manager) Unpublish(req *versionpb.VersionName) error {
	m.logger.Infof("Deactivating version '%s'", req.Name)
	return m.deleteEntrypointService(req.Name, m.config.Kubernetes.Namespace)
}

// UpdateConfig calls kubernetes to update a version config.
func (m *Manager) UpdateConfig(ctx context.Context, req *versionpb.UpdateConfigRequest) error {
	return m.restartPodsSync(ctx, req.VersionName, m.config.Kubernetes.Namespace)
}

func (m *Manager) WaitForVersionPods(ctx context.Context, versionName, ns string, versionWorkflows []*versionpb.Workflow) error {
	m.logger.Debugf("[WaitForVersionPods] watching ns '%s' for version '%s'", ns, versionName)

	nodes := []string{"entrypoint"}

	for _, w := range versionWorkflows {
		for _, n := range w.Nodes {
			nodes = append(nodes, n.Id)
		}
	}

	labelSelector := fmt.Sprintf("version-name=%s,type in (node, entrypoint)", versionName)
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
			m.logger.Infof("[WaitForVersionPods] context canceled. stop waiting.")
			return nil

		case <-time.After(timeoutWaitingForVersionPODS):
			return ErrWaitingForVersionPODSTimeout

		case <-waitCh:
			m.logger.Debugf("[WaitForVersionPods] all version pods for '%s' are running", versionName)
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
