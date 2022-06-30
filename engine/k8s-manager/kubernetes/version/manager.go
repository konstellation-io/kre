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

const (
	timeoutWaitingForVersionPODS = 10 * time.Minute
	activeEntrypoint             = "active-entrypoint"
)

var ErrWaitingForVersionPODSTimeout = errors.New("[WaitForVersionPods] timeout waiting for version pods")

func (m *Manager) getVersionServiceName(runtimeId, versionName string) string {
	return fmt.Sprintf("%s-%s-entrypoint", runtimeId, versionName)
}

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

	err := m.createVersionKRTConf(req.RuntimeId, req.VersionName, m.config.Kubernetes.Namespace, req.Config)
	if err != nil {
		return err
	}

	err = m.createVersionConfFiles(req.RuntimeId, req.VersionName, m.config.Kubernetes.Namespace, req.Workflows)
	if err != nil {
		return err
	}

	err = m.createAllNodeDeployments(req)
	if err != nil {
		return err
	}

	err = m.createEntrypoint(req)
	if err != nil {
		return err
	}

	serviceName := m.getVersionServiceName(req.RuntimeId, req.VersionName)
	_, err = m.createEntrypointService(req.RuntimeId, req.VersionName, serviceName, m.config.Kubernetes.Namespace)
	if err != nil {
		return err
	}

	return nil
}

// Stop calls kubernetes remove all version resources.
func (m *Manager) Stop(ctx context.Context, req *versionpb.VersionInfo) error {
	m.logger.Infof("Stop version %s on runtime %s", req.Name, req.RuntimeId)

	err := m.deleteConfigMapsSync(ctx, req.RuntimeId, req.Name, m.config.Kubernetes.Namespace)
	if err != nil {
		return err
	}

	serviceName := m.getVersionServiceName(req.RuntimeId, req.Name)

	err = m.deleteEntrypointService(serviceName, m.config.Kubernetes.Namespace)
	if err != nil {
		return err
	}

	return m.deleteDeploymentsSync(ctx, req.RuntimeId, req.Name, m.config.Kubernetes.Namespace)
}

// Publish calls kubernetes to change the name of the entrypoint service.
// The service-name will be changed to `active-entrypoint`
func (m *Manager) Publish(req *versionpb.VersionInfo) error {
	m.logger.Infof("Publish version '%s' on runtime '%s'", req.Name, req.RuntimeId)

	// check if there is an `active-entrypoint` service
	activeService, err := m.getActiveEntrypointService(m.config.Kubernetes.Namespace)
	if err != nil {
		return err
	}

	// if there is an `active-entrypoint` create a normal service for that entrypoint
	if activeService != nil {
		activeVersionName := activeService.Labels[versionNameLabel]
		activeServiceName := m.getVersionServiceName(req.RuntimeId, activeVersionName)

		m.logger.Debugf("There is an active entrypoint service with version name %s", activeVersionName)

		_, err = m.createEntrypointService(req.RuntimeId, activeVersionName, activeServiceName, m.config.Kubernetes.Namespace)
		if err != nil {
			return err
		}
	}

	serviceName := m.getVersionServiceName(req.RuntimeId, req.Name)

	err = m.deleteEntrypointService(serviceName, m.config.Kubernetes.Namespace)
	if err != nil {
		return err
	}

	_, err = m.createEntrypointService(req.RuntimeId, req.Name, activeEntrypoint, m.config.Kubernetes.Namespace)
	if err != nil {
		return err
	}

	return nil
}

// Unpublish calls kubernetes to change the name of the entrypoint service.
// The service-name will be changed to `VERSIONNAME-entrypoint`
func (m *Manager) Unpublish(req *versionpb.VersionInfo) error {
	m.logger.Infof("Deactivating version '%s' on runtime '%s'", req.Name, req.RuntimeId)

	err := m.deleteEntrypointService(activeEntrypoint, m.config.Kubernetes.Namespace)
	if err != nil {
		return err
	}

	serviceName := m.getVersionServiceName(req.RuntimeId, req.Name)

	_, err = m.createEntrypointService(req.RuntimeId, req.Name, serviceName, m.config.Kubernetes.Namespace)
	if err != nil {
		return err
	}

	return nil
}

// UpdateConfig calls kubernetes to update a version config.
// To achieve this, the version KRT config map is regenerated and the version PODs are restarted.
func (m *Manager) UpdateConfig(ctx context.Context, req *versionpb.UpdateConfigRequest) error {
	versionName := req.VersionName
	ns := m.config.Kubernetes.Namespace

	err := m.deleteVersionKRTConf(req.RuntimeId, versionName, ns)
	if err != nil {
		return err
	}

	err = m.createVersionKRTConf(req.RuntimeId, versionName, ns, req.Config)
	if err != nil {
		return err
	}

	return m.restartPodsSync(ctx, req.RuntimeId, versionName, ns)
}

func (m *Manager) WaitForVersionPods(ctx context.Context, runtimeId, versionName, ns string, versionWorkflows []*versionpb.Workflow) error {
	m.logger.Debugf("[WaitForVersionPods] watching ns '%s' for version '%s' and runtime '%s'", ns, versionName, runtimeId)

	nodes := []string{"entrypoint"}

	for _, w := range versionWorkflows {
		for _, n := range w.Nodes {
			nodes = append(nodes, n.Id)
		}
	}

	labelSelector := fmt.Sprintf("runtime-id=%s,version-name=%s,type in (node, entrypoint)", runtimeId, versionName)
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
			m.logger.Debugf("[WaitForVersionPods] all version pods for '%s-%s' are running", runtimeId, versionName)
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
