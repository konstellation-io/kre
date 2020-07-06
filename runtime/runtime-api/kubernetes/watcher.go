package kubernetes

import (
	"fmt"

	"github.com/konstellation-io/kre/libs/simplelogger"

	v1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"

	"github.com/konstellation-io/kre/runtime/runtime-api/config"
	"github.com/konstellation-io/kre/runtime/runtime-api/entity"
)

type Watcher struct {
	config    *config.Config
	logger    *simplelogger.SimpleLogger
	clientset *kubernetes.Clientset
}

func NewWatcher(config *config.Config, logger *simplelogger.SimpleLogger, clientset *kubernetes.Clientset) *Watcher {
	return &Watcher{
		config,
		logger,
		clientset,
	}
}

func (w *Watcher) NodeStatus(versionName string, statusCh chan<- entity.Node) chan struct{} {
	ns := w.config.Kubernetes.Namespace

	w.logger.Debugf("Watching node status of version: %s", versionName)

	factory := informers.NewSharedInformerFactoryWithOptions(w.clientset, 0,
		informers.WithNamespace(ns),
		informers.WithTweakListOptions(func(options *metav1.ListOptions) {
			options.LabelSelector = fmt.Sprintf("version-name=%s,type=node", versionName)
		}))

	informer := factory.Apps().V1().Deployments().Informer()

	resolver := NodeStatusResolver{
		out:    statusCh,
		logger: w.logger,
	}
	stopCh := make(chan struct{})

	go func() {
		handlers := cache.ResourceEventHandlerFuncs{
			AddFunc:    resolver.OnAdd,
			UpdateFunc: resolver.OnUpdate,
			DeleteFunc: resolver.OnDelete,
		}

		w.logger.Debugf("Starting informer for version watcher: %s", versionName)

		informer.AddEventHandler(handlers)
		informer.Run(stopCh)
	}()

	return stopCh
}

type NodeStatusResolver struct {
	out    chan<- entity.Node
	logger *simplelogger.SimpleLogger
}

func newNode(labels map[string]string, status entity.NodeStatus) entity.Node {
	return entity.Node{
		ID:     labels["node-id"],
		Name:   labels["node-name"],
		Status: status,
	}
}

func (n *NodeStatusResolver) OnAdd(obj interface{}) {
	d, ok := obj.(*v1.Deployment)
	if !ok {
		return
	}

	ready := d.Status.ReadyReplicas
	total := d.Status.Replicas

	if ready == total && total > 0 {
		n.out <- newNode(d.Labels, entity.NodeStatusStarted)
	} else {
		n.out <- newNode(d.Labels, entity.NodeStatusError)
	}

	n.logger.Infof("\n[NodeStatusResolver.OnAdd] Deployment: %63s  ready/total: %d/%d\n", d.Name, ready, total)
}

func (n *NodeStatusResolver) OnUpdate(_, obj interface{}) {
	d, ok := obj.(*v1.Deployment)
	if !ok {
		return
	}

	ready := d.Status.ReadyReplicas
	total := d.Status.Replicas

	if d.Status.UnavailableReplicas != 0 {
		n.out <- newNode(d.Labels, entity.NodeStatusError)
	} else if ready == total && total > 0 {
		n.out <- newNode(d.Labels, entity.NodeStatusStarted)
	}
	n.logger.Debugf("\n[NodeStatusResolver.OnUpdate] Deployment: %63s  ready/total: %d/%d\n", d.Name, ready, total)
}

func (n *NodeStatusResolver) OnDelete(obj interface{}) {
	d, ok := obj.(*v1.Deployment)
	if !ok {
		return
	}

	ready := d.Status.ReadyReplicas
	total := d.Status.Replicas
	if total == 0 && ready == 0 {
		n.out <- newNode(d.Labels, entity.NodeStatusStopped)
	}
	n.logger.Infof("\n[NodeStatusResolver.OnDelete] Deployment: %63s  ready/total: %d/%d\n", d.Name, ready, total)
}
