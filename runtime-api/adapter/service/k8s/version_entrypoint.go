package k8s

import (
	"fmt"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func (k *ResourceManagerService) createEntrypoint(name string) error {
	k.logger.Info("Creating Entrypoint deployment...")
	_, err := k.createEntrypointDeployment(name)
	if err != nil {
		return err
	}

	_, err = k.createEntrypointService(name)
	if err != nil {
		return err
	}

	k.logger.Info(fmt.Sprintf("Entrypoint %s created.", name))

	return nil
}

func (k *ResourceManagerService) createEntrypointDeployment(name string) (*appsv1.Deployment, error) {
	namespace := k.cfg.Kubernetes.Namespace
	entrypointName := name + "-version-entrypoint"
	entrypointImage := "quay.io/mhausenblas/yages:0.1.0" // TODO: Change to our own entrypoint image

	return k.clientset.AppsV1().Deployments(name).Create(&appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      entrypointName,
			Namespace: namespace,
			Labels: map[string]string{
				"app": entrypointName,
			},
		},
		Spec: appsv1.DeploymentSpec{
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": entrypointName,
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:            entrypointName,
							Image:           entrypointImage,
							ImagePullPolicy: apiv1.PullIfNotPresent,
							Ports: []apiv1.ContainerPort{
								{
									ContainerPort: 9000,
									Protocol:      "TCP",
								},
							},
						},
					},
				},
			},
		},
	})
}

func (k *ResourceManagerService) createEntrypointService(name string) (*apiv1.Service, error) {
	namespace := k.cfg.Kubernetes.Namespace
	entrypointName := name + "-version-entrypoint"

	return k.clientset.CoreV1().Services(namespace).Create(&apiv1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name: entrypointName,
			Labels: map[string]string{
				"app": entrypointName,
			},
		},
		Spec: apiv1.ServiceSpec{
			Type: apiv1.ServiceTypeClusterIP,
			Ports: []apiv1.ServicePort{
				{
					Name:       "grpc",
					Protocol:   "TCP",
					TargetPort: intstr.IntOrString{IntVal: 9000},
					Port:       9000,
				},
			},
			Selector: map[string]string{
				"app": entrypointName,
			},
		},
	})
}
