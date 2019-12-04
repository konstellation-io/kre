package kubernetes

import (
	"fmt"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"log"
	"strings"
	"time"
)

func (k *ResourceManager) WaitForPods(ns string) error {
	timeout := 5 * time.Minute

	minioChan, err := k.waitForPodRunning(ns, []string{"app=kre-minio"}, timeout)
	if err != nil {
		return err
	}

	mongoChan, err := k.waitForPodRunning(ns, []string{"app=kre-mongo"}, timeout)
	if err != nil {
		return err
	}

	//natsChan, err := k.waitForPodRunning(ns, []string{"app=kre-nats"}, timeout)
	//if err != nil {
	//	return err
	//}

	kreOperatorChan, err := k.waitForPodRunning(ns, []string{"name=kre-operator"}, timeout)
	if err != nil {
		return err
	}

	minioRunning, mongoRunning, kreOperatorRunning := <-minioChan, <-mongoChan, <-kreOperatorChan

	var failedPods []string
	if !minioRunning {
		failedPods = append(failedPods, "Minio")
	}

	if !mongoRunning {
		failedPods = append(failedPods, "MongoDB")
	}

	//if !natsRunning {
	//	failedPods = append(failedPods, "NATS")
	//}

	if !kreOperatorRunning {
		failedPods = append(failedPods, "KREOperator")
	}

	if len(failedPods) > 0 {
		return fmt.Errorf("the following components %v are not running in the namespace \"%s\" within %s", failedPods, ns, timeout)
	}

	return nil
}

func (k *ResourceManager) waitForPodRunning(ns string, podLabels []string, timeToWait time.Duration) (chan bool, error) {
	waitChan := make(chan bool)

	labelSelector := strings.Join(podLabels, ",")
	log.Printf("Creating watcher for POD with labels: %s\n", labelSelector)

	watch, err := k.clientset.CoreV1().Pods(ns).Watch(metav1.ListOptions{
		LabelSelector: labelSelector,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to set up watch for pod (error: %v)", err)
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
