package k8s

import (
	"fmt"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func (k *ResourceManagerService) createEntrypoint(id, name string) error {
	k.logger.Info("Creating Entrypoint deployment...")
	_, err := k.createEntrypointDeployment(id, name)
	if err != nil {
		return err
	}

	// TODO: Delete current service with name active entrypoint
	_, err = k.createEntrypointService(id, name)
	if err != nil {
		return err
	}

	k.logger.Info(fmt.Sprintf("Entrypoint %s created.", name))

	return nil
}

func (k *ResourceManagerService) createEntrypointDeployment(id, name string) (*appsv1.Deployment, error) {
	namespace := k.cfg.Kubernetes.Namespace
	entrypointName := fmt.Sprintf("%s-%s-version-entrypoint", name, id)

	// TODO: Change to specific version
	entrypointImage := "konstellation/kre-runtime-entrypoint:latest"

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
						"app":          entrypointName,
						"version-name": name,
						"version-id":   id,
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

func (k *ResourceManagerService) createEntrypointService(id, name string) (*apiv1.Service, error) {
	namespace := k.cfg.Kubernetes.Namespace
	entrypointName := fmt.Sprintf("%s-%s-version-entrypoint", name, id)

	return k.clientset.CoreV1().Services(namespace).Create(&apiv1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name: "active-entrypoint",
			Labels: map[string]string{
				"app":          entrypointName,
				"version-name": name,
				"version-id":   id,
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
				"app":          entrypointName,
				"version-name": name,
				"version-id":   id,
			},
		},
	})
}
