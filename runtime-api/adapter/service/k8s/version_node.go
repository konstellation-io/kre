package k8s

import (
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
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

func (k *ResourceManagerService) createNodeDeployment(namespace string, version *entity.Version, node *entity.Node, nodeConfig, versionConfig string) (*appsv1.Deployment, error) {
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
							ImagePullPolicy: apiv1.PullAlways,
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
											Name: versionConfig,
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
							},
						},
					},
					Volumes: []apiv1.Volume{
						{
							Name: "shared-data",
							VolumeSource: apiv1.VolumeSource{
								PersistentVolumeClaim: &apiv1.PersistentVolumeClaimVolumeSource{
									ClaimName: "kre-minio-pvc-kre-minio-0",
									ReadOnly:  true,
								},
							},
						},
					},
				},
			},
		},
	})
}

func (k *ResourceManagerService) restartVersionPods(label, namespace string) error {
	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	}

	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", label),
		Watch:         false,
		TypeMeta: metav1.TypeMeta{
			Kind: "Pod",
		},
	}

	// Delete pods for restart
	return k.clientset.CoreV1().Pods(namespace).DeleteCollection(deleteOptions, listOptions)
}

func (k *ResourceManagerService) deleteVersionResources(label, namespace string) error {
	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	}

	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", label),
		Watch:         false,
	}

	// Delete configmaps
	err := k.clientset.CoreV1().ConfigMaps(namespace).DeleteCollection(deleteOptions, listOptions)
	if err != nil {
		return err
	}

	// Delete deployments
	return k.clientset.AppsV1().Deployments(namespace).DeleteCollection(deleteOptions, listOptions)
}
