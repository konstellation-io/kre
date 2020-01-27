package k8s

import (
	"errors"
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	"time"
)

func (k *ResourceManagerService) createNodeConfigmap(namespace string, version *entity.Version, node *entity.Node) (string, error) {
	name := fmt.Sprintf("%s-%s", strcase.ToKebab(node.Name), node.ID)
	nodeConfig, err := k.clientset.CoreV1().ConfigMaps(namespace).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
			Labels: map[string]string{
				"type":         "node",
				"version-name": strcase.ToKebab(version.Name),
				"node-name":    node.Name,
				"node-id":      node.ID,
			},
		},
		Data: node.Config,
	})

	if err != nil {
		return "", err
	}

	return nodeConfig.Name, nil
}

func (k *ResourceManagerService) createNodeDeployment(namespace string, version *entity.Version, node *entity.Node, nodeConfig string) (*appsv1.Deployment, error) {
	name := fmt.Sprintf("%s-%s-%s", strcase.ToKebab(version.Name), strcase.ToKebab(node.Name), node.ID)
	k.logger.Info(fmt.Sprintf("Creating node deployment in %s named %s from image %s", namespace, name, node.Image))

	return k.clientset.AppsV1().Deployments(namespace).Create(&appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
			Labels: map[string]string{
				"type":         "node",
				"version-name": strcase.ToKebab(version.Name),
				"node-name":    node.Name,
				"node-id":      node.ID,
			},
		},
		Spec: appsv1.DeploymentSpec{
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"type":         "node",
					"version-name": strcase.ToKebab(version.Name),
					"node-name":    node.Name,
					"node-id":      node.ID,
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"type":         "node",
						"version-name": strcase.ToKebab(version.Name),
						"node-name":    node.Name,
						"node-id":      node.ID,
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:            name,
							Image:           node.Image,
							ImagePullPolicy: apiv1.PullIfNotPresent,
							Env: []apiv1.EnvVar{
								{
									Name:  "KRE_VERSION_NAME",
									Value: strcase.ToKebab(version.Name),
								},
								{
									Name:  "KRE_NODE_NAME",
									Value: node.Name,
								},
								{
									Name:  "KRE_NODE_ID",
									Value: node.ID,
								},
							},
							EnvFrom: []apiv1.EnvFromSource{
								{
									ConfigMapRef: &apiv1.ConfigMapEnvSource{
										LocalObjectReference: apiv1.LocalObjectReference{
											Name: nodeConfig,
										},
									},
								},
								{
									ConfigMapRef: &apiv1.ConfigMapEnvSource{
										LocalObjectReference: apiv1.LocalObjectReference{
											Name: fmt.Sprintf("%s-conf-files", strcase.ToKebab(version.Name)),
										},
									},
								},
							},
							VolumeMounts: []apiv1.VolumeMount{
								{
									Name:      "shared-data",
									ReadOnly:  true,
									MountPath: "/krt-files",
									SubPath:   strcase.ToKebab(version.Name),
								},
								{
									Name:      "app-log-volume",
									MountPath: "/var/log/app",
								},
							},
						},
						{
							Name:            "fluent-bit",
							Image:           "fluent/fluent-bit:1.3",
							ImagePullPolicy: apiv1.PullIfNotPresent,
							Command: []string{
								"/fluent-bit/bin/fluent-bit",
								"-c",
								"/fluent-bit/etc/fluent-bit.conf",
								"-v",
							},
							Env: []apiv1.EnvVar{
								{
									Name:  "KRE_VERSION_NAME",
									Value: strcase.ToKebab(version.Name),
								},
								{
									Name:  "KRE_NODE_NAME",
									Value: node.Name,
								},
								{
									Name:  "KRE_NODE_ID",
									Value: node.ID,
								},
							},
							VolumeMounts: []apiv1.VolumeMount{
								{
									Name:      "version-conf-files",
									ReadOnly:  true,
									MountPath: "/fluent-bit/etc/fluent-bit.conf",
									SubPath:   "fluent-bit.conf",
								},
								{
									Name:      "app-log-volume",
									ReadOnly:  true,
									MountPath: "/var/log/app",
								},
							},
						},
					},
					Volumes: []apiv1.Volume{
						{
							Name: "version-conf-files",
							VolumeSource: apiv1.VolumeSource{
								ConfigMap: &apiv1.ConfigMapVolumeSource{
									LocalObjectReference: apiv1.LocalObjectReference{
										Name: fmt.Sprintf("%s-conf-files", strcase.ToKebab(version.Name)),
									},
								},
							},
						},
						{
							Name: "shared-data",
							VolumeSource: apiv1.VolumeSource{
								PersistentVolumeClaim: &apiv1.PersistentVolumeClaimVolumeSource{
									ClaimName: "kre-minio-pvc-kre-minio-0",
									ReadOnly:  true,
								},
							},
						},
						{
							Name: "app-log-volume",
							VolumeSource: apiv1.VolumeSource{
								EmptyDir: &apiv1.EmptyDirVolumeSource{},
							},
						},
					},
				},
			},
		},
	})
}

func (k *ResourceManagerService) deleteVersionResources(label, namespace string) error {
	err := k.deleteConfigMapsSync(label, namespace)
	if err != nil {
		return err
	}

	return k.deleteDeploymentsSync(label, namespace)
}

// FIXME Restart Pod Sync Is not waiting for ready state of PODs
func (k *ResourceManagerService) restartPodsSync(label, namespace string) error {
	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	}

	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", label),
		TypeMeta: metav1.TypeMeta{
			Kind: "Pod",
		},
	}

	pods := k.clientset.CoreV1().Pods(namespace)
	list, err := pods.List(listOptions)
	if err != nil {
		return err
	}
	numPods := len(list.Items)

	if numPods == 0 {
		return nil
	}

	err = pods.DeleteCollection(deleteOptions, listOptions)
	if err != nil {
		return err
	}

	startTime := time.Now()
	timeToWait := 3 * time.Minute
	w, err := pods.Watch(listOptions)
	if err != nil {
		return err
	}

	watchResults := w.ResultChan()
	for {
		select {
		case event := <-watchResults:
			pod := event.Object.(*apiv1.Pod)

			if pod.Status.Phase == apiv1.PodRunning {
				numPods = numPods - 1
				if numPods == 0 {
					w.Stop()
					return nil
				}
			}

		case <-time.After(timeToWait - time.Since(startTime)):
			w.Stop()
			return errors.New("timeout restarting pods")
		}
	}
}

// TODO try to reuse code
func (k *ResourceManagerService) deleteDeploymentsSync(label, namespace string) error {
	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	}

	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", label),
		TypeMeta: metav1.TypeMeta{
			Kind: "Deployment",
		},
	}

	deployments := k.clientset.AppsV1().Deployments(namespace)
	list, err := deployments.List(listOptions)
	if err != nil {
		return err
	}
	numDeployments := len(list.Items)

	if numDeployments == 0 {
		return nil
	}

	err = deployments.DeleteCollection(deleteOptions, listOptions)
	if err != nil {
		return err
	}

	startTime := time.Now()
	timeToWait := 5 * time.Minute
	w, err := deployments.Watch(listOptions)
	if err != nil {
		return err
	}

	watchResults := w.ResultChan()
	for {
		select {
		case event := <-watchResults:
			if event.Type == watch.Deleted {
				numDeployments = numDeployments - 1
				if numDeployments == 0 {
					w.Stop()
					return nil
				}
			}

		case <-time.After(timeToWait - time.Since(startTime)):
			w.Stop()
			return errors.New("timeout deleting deployments")
		}
	}
}

// TODO try to reuse code
func (k *ResourceManagerService) deleteConfigMapsSync(label, namespace string) error {
	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	}

	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", label),
		TypeMeta: metav1.TypeMeta{
			Kind: "ConfigMap",
		},
	}

	configMaps := k.clientset.CoreV1().ConfigMaps(namespace)
	list, err := configMaps.List(listOptions)
	if err != nil {
		return err
	}
	numConfigMaps := len(list.Items)

	if numConfigMaps == 0 {
		return nil
	}

	err = configMaps.DeleteCollection(deleteOptions, listOptions)
	if err != nil {
		return err
	}

	startTime := time.Now()
	timeToWait := 2 * time.Minute
	w, err := configMaps.Watch(listOptions)
	if err != nil {
		return err
	}

	watchResults := w.ResultChan()
	for {
		select {
		case event := <-watchResults:
			if event.Type == watch.Deleted {
				numConfigMaps = numConfigMaps - 1
				if numConfigMaps == 0 {
					w.Stop()
					return nil
				}
			}

		case <-time.After(timeToWait - time.Since(startTime)):
			w.Stop()
			return errors.New("timeout deleting config maps")
		}
	}
}
