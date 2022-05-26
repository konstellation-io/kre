package kubernetes

import (
	"errors"
	"fmt"
	"github.com/konstellation-io/kre/engine/k8s-manager/config"
	"github.com/konstellation-io/kre/engine/k8s-manager/entity"
	"github.com/konstellation-io/kre/engine/k8s-manager/kubernetes/node"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
	"strings"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

var ErrWaitForPODsRunningTimeout = errors.New("timeout waiting for running PODs")

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

const timeout = 5 * time.Minute

func (w *Watcher) WaitForRuntimePods(ns string) error {
	mongoChan, err := w.waitForPodRunning(ns, []string{"kre-app=kre-mongo"}, timeout)
	if err != nil {
		return err
	}

	natsChan, err := w.waitForPodRunning(ns, []string{"app=kre-nats"}, timeout)
	if err != nil {
		return err
	}

	kreOperatorChan, err := w.waitForPodRunning(ns, []string{"name=k8s-runtime-operator"}, timeout)
	if err != nil {
		return err
	}

	mongoRunning,
		kreOperatorRunning,
		natsRunning :=
		<-mongoChan,
		<-kreOperatorChan,
		<-natsChan

	var failedPods []string

	if !mongoRunning {
		failedPods = append(failedPods, "MongoDB")
	}

	if !natsRunning {
		failedPods = append(failedPods, "NATS")
	}

	if !kreOperatorRunning {
		failedPods = append(failedPods, "K8sRuntimeOperator")
	}

	if len(failedPods) > 0 {
		return fmt.Errorf("%w: elapsed time %s missing PODs \"%s\" in Namespace \"%s\"",
			ErrWaitForPODsRunningTimeout, timeout, failedPods, ns)
	}

	return nil
}

func (w *Watcher) waitForPodRunning(ns string, podLabels []string, timeToWait time.Duration) (chan bool, error) {
	waitChan := make(chan bool)

	labelSelector := strings.Join(podLabels, ",")
	w.logger.Debugf("Creating watcher for POD with labels: %s\n", labelSelector)

	watch, err := w.clientset.CoreV1().Pods(ns).Watch(metav1.ListOptions{
		LabelSelector: labelSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to set up watch for pod: %w", err)
	}

	go func() {
		events := watch.ResultChan()

		startTime := time.Now()

		for {
			select {
			case event := <-events:
				pod := event.Object.(*v1.Pod)

				if pod.Status.Phase == v1.PodRunning {
					w.logger.Debugf("The POD with labels \"%s\" is running\n", labelSelector)
					watch.Stop()
					waitChan <- true
					close(waitChan)

					return
				}
			case <-time.After(timeToWait - time.Since(startTime)):
				watch.Stop()
				waitChan <- false
				close(waitChan)

				return
			}
		}
	}()

	return waitChan, nil
}

func (w *Watcher) WatchNodeStatus(runtimeId, versionName string, statusCh chan<- entity.Node) chan struct{} {
	w.logger.Debugf("[WatchNodeStatus] watching '%s'", versionName)

	labelSelector := fmt.Sprintf("runtime-id=%s,version-name=%s,type in (node, entrypoint)", runtimeId, versionName)
	resolver := node.NodeStatusResolver{
		Out:        statusCh,
		Logger:     w.logger,
		LastStatus: map[string]entity.NodeStatus{},
	}

	return w.watchResources(labelSelector, cache.ResourceEventHandlerFuncs{
		AddFunc:    resolver.OnAdd,
		UpdateFunc: resolver.OnUpdate,
		DeleteFunc: resolver.OnDelete,
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
