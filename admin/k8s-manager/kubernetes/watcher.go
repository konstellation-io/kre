package kubernetes

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

var ErrWaitForPODsRunningTimeout = errors.New("timeout waiting for running PODs")

type Watcher struct {
	logger    *simplelogger.SimpleLogger
	clientset *kubernetes.Clientset
}

func NewWatcher(logger *simplelogger.SimpleLogger, clientset *kubernetes.Clientset) *Watcher {
	return &Watcher{
		logger,
		clientset,
	}
}

const timeout = 5 * time.Minute

func (k *Watcher) WaitForRuntimePods(ns string) error {
	mongoChan, err := k.waitForPodRunning(ns, []string{"kre-app=kre-mongo"}, timeout)
	if err != nil {
		return err
	}

	natsChan, err := k.waitForPodRunning(ns, []string{"app=kre-nats"}, timeout)
	if err != nil {
		return err
	}

	kreOperatorChan, err := k.waitForPodRunning(ns, []string{"name=k8s-runtime-operator"}, timeout)
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

func (k *Watcher) waitForPodRunning(ns string, podLabels []string, timeToWait time.Duration) (chan bool, error) {
	waitChan := make(chan bool)

	labelSelector := strings.Join(podLabels, ",")
	k.logger.Debugf("Creating watcher for POD with labels: %s\n", labelSelector)

	watch, err := k.clientset.CoreV1().Pods(ns).Watch(metav1.ListOptions{
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
					k.logger.Debugf("The POD with labels \"%s\" is running\n", labelSelector)
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
