package kubernetes

import (
	"fmt"

	"github.com/konstellation-io/kre/libs/simplelogger"
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

func (w *Watcher) WatchNodeStatus(versionName string, statusCh chan<- entity.Node) chan struct{} {
	w.logger.Debugf("[WatchNodeStatus] watching '%s'", versionName)

	labelSelector := fmt.Sprintf("version-name=%s,type in (node, entrypoint)", versionName)
	resolver := NodeStatusResolver{
		out:        statusCh,
		logger:     w.logger,
		lastStatus: map[string]entity.NodeStatus{},
	}

	return w.watchResources(labelSelector, cache.ResourceEventHandlerFuncs{
		AddFunc:    resolver.onAdd,
		UpdateFunc: resolver.onUpdate,
		DeleteFunc: resolver.onDelete,
	})
}

func (w *Watcher) watchResources(labelSelector string, handlers cache.ResourceEventHandler) chan struct{} {
	stopCh := make(chan struct{})

	go func() {
		w.logger.Debugf("Starting informer with labelSelector: %s ", labelSelector)

		factory := informers.NewSharedInformerFactoryWithOptions(w.clientset, 0,
			informers.WithNamespace(w.config.Kubernetes.Namespace),
			informers.WithTweakListOptions(func(options *metav1.ListOptions) {
				options.LabelSelector = labelSelector
			}))

		informer := factory.Core().V1().Pods().Informer()
		informer.AddEventHandler(handlers)
		informer.Run(stopCh)
	}()

	return stopCh
}
