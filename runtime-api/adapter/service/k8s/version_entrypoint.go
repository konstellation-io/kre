package k8s

import (
	"fmt"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func (k *ResourceManagerService) createEntrypoint(name string) error {
	resourceName := fmt.Sprintf("%s-version-entrypoint", name)
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info("Creating Entrypoint deployment...")
	_, err := k.createEntrypointDeployment(resourceName, namespace, name)
	if err != nil {
		return err
	}

	_, err = k.updateEntrypointService(resourceName, namespace, name)
	if err != nil {
		return err
	}

	k.logger.Info(fmt.Sprintf("Entrypoint %s created.", name))

	return nil
}

func (k *ResourceManagerService) createEntrypointDeployment(name, namespace, versionLabel string) (*appsv1.Deployment, error) {
	// TODO: Change to specific version
	entrypointImage := "konstellation/kre-runtime-entrypoint:latest"

	k.logger.Info(fmt.Sprintf("Creating deployment in %s named %s from image %s", namespace, name, entrypointImage))

	return k.clientset.AppsV1().Deployments(namespace).Create(&appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
			Labels: map[string]string{
				"app":          name,
				"version-name": versionLabel,
			},
		},
		Spec: appsv1.DeploymentSpec{
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app":          name,
					"version-name": versionLabel,
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app":          name,
						"version-name": versionLabel,
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:            name,
							Image:           entrypointImage,
							ImagePullPolicy: apiv1.PullIfNotPresent,
							Ports: []apiv1.ContainerPort{
								{
									ContainerPort: 50051,
									Protocol:      "TCP",
								},
							},
						},
						{
							Name:            fmt.Sprintf("%s-web", name),
							Image:           "nginx:alpine",
							ImagePullPolicy: apiv1.PullIfNotPresent,
							Ports: []apiv1.ContainerPort{
								{
									ContainerPort: 80,
									Protocol:      "TCP",
								},
							},
							// TODO:
							//  - Mount nginx.conf as configmap
							//  - Mount proto files from minio
						},
					},
				},
			},
		},
	})
}

func (k *ResourceManagerService) updateEntrypointService(name, namespace, versionLabel string) (*apiv1.Service, error) {
	k.logger.Info(fmt.Sprintf("Updating service in %s named %s", namespace, name))

	serviceLabels := map[string]string{
		"app":          name,
		"version-name": versionLabel,
	}

	existingService, err := k.clientset.CoreV1().Services(namespace).Get("active-entrypoint", metav1.GetOptions{})
	if errors.IsNotFound(err) {
		return k.clientset.CoreV1().Services(namespace).Create(&apiv1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:   "active-entrypoint",
				Labels: serviceLabels,
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
					{
						Name:       "web",
						Protocol:   "TCP",
						TargetPort: intstr.IntOrString{IntVal: 80},
						Port:       80,
					},
				},
				Selector: serviceLabels,
			},
		})
	} else if err != nil {
		return nil, err
	} else {
		existingService.ObjectMeta.Labels = serviceLabels
		existingService.Spec.Selector = serviceLabels

		return k.clientset.CoreV1().Services(namespace).Update(existingService)
	}

}
