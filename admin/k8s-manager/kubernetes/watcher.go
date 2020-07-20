package kubernetes

import (
	"fmt"
	"log"
	"strings"
	"time"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Watcher struct {
	clientset *kubernetes.Clientset
}

func NewWatcher(clientset *kubernetes.Clientset) *Watcher {
	return &Watcher{
		clientset,
	}
}

const timeout = 5 * time.Minute

func (k *Watcher) WaitForPods(ns string) error {
	minioChan, err := k.waitForPodRunning(ns, []string{"app=kre-minio"}, timeout)
	if err != nil {
		return err
	}

	minioReadyChan, err := k.waitForPodReady(ns, []string{"app=kre-minio"}, timeout)
	if err != nil {
		return err
	}

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

	minioRunning,
		minioReady,
		mongoRunning,
		kreOperatorRunning,
		natsRunning :=
		<-minioChan,
		<-minioReadyChan,
		<-mongoChan,
		<-kreOperatorChan,
		<-natsChan

	var failedPods []string

	if !minioRunning {
		failedPods = append(failedPods, "Minio")
	}

	if !minioReady {
		failedPods = append(failedPods, "MinioReady")
	}

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
		// nolint:goerr113
		return fmt.Errorf("the following components '%v' are not running in the namespace '%s' within '%s'",
			failedPods, ns, timeout)
	}

	return nil
}

// nolint:unparam
func (k *Watcher) waitForPodRunning(ns string, podLabels []string, timeToWait time.Duration) (chan bool, error) {
	waitChan := make(chan bool)

	labelSelector := strings.Join(podLabels, ",")
	log.Printf("Creating watcher for POD with labels: %s\n", labelSelector)

	watch, err := k.clientset.CoreV1().Pods(ns).Watch(metav1.ListOptions{
		LabelSelector: labelSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to set up watch for pod (error: %w)", err)
	}

	go func() {
		events := watch.ResultChan()

		startTime := time.Now()

		for {
			select {
			case event := <-events:
				pod := event.Object.(*v1.Pod)

				if pod.Status.Phase == v1.PodRunning {
					log.Printf("The POD with labels \"%s\" is running\n", labelSelector)
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

func (k *Watcher) waitForPodReady(ns string, podLabels []string, timeToWait time.Duration) (chan bool, error) {
	waitChan := make(chan bool)

	labelSelector := strings.Join(podLabels, ",")
	log.Printf("Creating watcher for POD with labels: %s\n", labelSelector)

	watch, err := k.clientset.CoreV1().Pods(ns).Watch(metav1.ListOptions{
		LabelSelector: labelSelector,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to set up watch for pod (error: %w)", err)
	}

	go func() {
		events := watch.ResultChan()

		startTime := time.Now()

		for {
			select {
			case event := <-events:
				pod := event.Object.(*v1.Pod)
				// If the Pod contains a status condition Ready == True, stop watching.
				for _, cond := range pod.Status.Conditions {
					if cond.Type == v1.PodReady && cond.Status == v1.ConditionTrue {
						log.Printf("The POD with labels \"%s\" is ready\n", labelSelector)
						watch.Stop()
						waitChan <- true
						close(waitChan)

						return
					}
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
