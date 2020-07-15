package kubernetes

import (
	"fmt"
	"github.com/konstellation-io/kre/libs/simplelogger"

	coreV1 "k8s.io/api/core/v1"
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
	w.logger.Debugf("Watching node status of version: %s", versionName)

	ns := w.config.Kubernetes.Namespace

	factory := informers.NewSharedInformerFactoryWithOptions(w.clientset, 0,
		informers.WithNamespace(ns),
		informers.WithTweakListOptions(func(options *metav1.ListOptions) {
			options.LabelSelector = fmt.Sprintf("version-name=%s,type=node", versionName)
		}))

	informer := factory.Core().V1().Pods().Informer()

	resolver := NodeStatusResolver{
		out:        statusCh,
		logger:     w.logger,
		lastStatus: map[string]entity.NodeStatus{},
	}

	stopCh := make(chan struct{})

	go func() {
		w.logger.Debugf("Starting informer for version watcher: %s", versionName)
		handlers := cache.ResourceEventHandlerFuncs{
			AddFunc:    resolver.onAdd,
			UpdateFunc: resolver.onUpdate,
			DeleteFunc: resolver.onDelete,
		}
		informer.AddEventHandler(handlers)
		informer.Run(stopCh)
	}()

	return stopCh
}

type NodeStatusResolver struct {
	out        chan<- entity.Node
	logger     *simplelogger.SimpleLogger
	lastStatus map[string]entity.NodeStatus
}

func (n *NodeStatusResolver) onAdd(obj interface{}) {
	n.onAddOrUpdate(obj)
}

func (n *NodeStatusResolver) onUpdate(_, obj interface{}) {
	n.onAddOrUpdate(obj)
}

func (n *NodeStatusResolver) onDelete(obj interface{}) {
	p := obj.(*coreV1.Pod)
	n.sendNodeStatus(n.newNode(p.Labels, entity.NodeStatusStopped))
}

func (n *NodeStatusResolver) onAddOrUpdate(obj interface{}) {
	p := obj.(*coreV1.Pod)
	if s, ok := n.getNodeStatus(p); ok {
		n.sendNodeStatus(n.newNode(p.Labels, s))
	}
}

func (n *NodeStatusResolver) sendNodeStatus(node entity.Node) {
	lastStatus, found := n.lastStatus[node.ID]
	if !found || node.Status != lastStatus {
		n.out <- node
		n.lastStatus[node.ID] = node.Status
	}
}

func (n *NodeStatusResolver) newNode(labels map[string]string, status entity.NodeStatus) entity.Node {
	return entity.Node{
		ID:     labels["node-id"],
		Name:   labels["node-name"],
		Status: status,
	}
}

func (n *NodeStatusResolver) getNodeStatus(p *coreV1.Pod) (entity.NodeStatus, bool) {
	total := 0
	running := 0
	terminated := 0
	waiting := 0
	crashLoopBackOff := 0
	containerCreating := 0

	for _, cs := range p.Status.ContainerStatuses {
		total++

		if cs.State.Running != nil {
			running++
		}

		if cs.State.Terminated != nil {
			terminated++
		}

		if cs.State.Waiting != nil {
			waiting++

			if cs.State.Waiting.Reason == "CrashLoopBackOff" {
				crashLoopBackOff++
			} else if cs.State.Waiting.Reason == "ContainerCreating" {
				containerCreating++
			}
		}
	}

	n.logger.Debugf("[NodeStatusResolver.getNodeStatus] POD[%s] total[%d] running[%d] terminated[%d] waiting[%d] crashLoopBackOff[%d] containerCreating[%d]",
		p.Name, total, running, terminated, waiting, crashLoopBackOff, containerCreating)

	if terminated == total {
		return entity.NodeStatusStopped, true
	}

	if terminated > 0 || crashLoopBackOff > 0 {
		return entity.NodeStatusError, true
	}

	if containerCreating == total {
		return entity.NodeStatusStarting, true
	}

	if running == total {
		return entity.NodeStatusStarted, true
	}

	return entity.NodeStatusError, false
}
