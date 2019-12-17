package k8s

import (
	"fmt"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func (k *ResourceManagerService) createEntrypointConfigmap(namespace string) (*apiv1.ConfigMap, error) {
	_, err := k.clientset.CoreV1().ConfigMaps(namespace).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name: "entrypoint-nginx",
		},
		Data: map[string]string{
			"nginx.conf": `server {
        listen       80;
        server_name  localhost;

        location / {
            root   /proto;
            autoindex on;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
`,
		},
	})
	if err != nil {
		return nil, err
	}

	// TODO: Read proto files from Minio
	return k.clientset.CoreV1().ConfigMaps(namespace).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name: "entrypoint-protofiles",
		},
		Data: map[string]string{
			"entrypoint.proto": `syntax = "proto3";

    package entrypoint;

    service EchoService {
        rpc Ping (PingRequest) returns (PingResponse) {}
    }

    message PingRequest {}

    message PingResponse{
        bool success = 1;
    }
`,
		},
	})
}

func (k *ResourceManagerService) createEntrypointDeployment(name, namespace, label string) (*appsv1.Deployment, error) {
	// TODO: Change to specific version
	entrypointImage := "konstellation/kre-runtime-entrypoint:latest"

	k.logger.Info(fmt.Sprintf("Creating deployment in %s named %s from image %s", namespace, name, entrypointImage))

	return k.clientset.AppsV1().Deployments(namespace).Create(&appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
			Labels: map[string]string{
				"app":          name,
				"version-name": label,
			},
		},
		Spec: appsv1.DeploymentSpec{
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app":          name,
					"version-name": label,
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app":          name,
						"version-name": label,
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
									ContainerPort: 9000,
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
							VolumeMounts: []apiv1.VolumeMount{
								{
									Name:      "nginx-conf",
									ReadOnly:  true,
									MountPath: "/etc/nginx/conf.d/",
								},
								{
									Name:      "proto-files",
									ReadOnly:  true,
									MountPath: "/proto",
								},
							},
						},
					},
					Volumes: []apiv1.Volume{
						{
							Name: "nginx-conf",
							VolumeSource: apiv1.VolumeSource{
								ConfigMap: &apiv1.ConfigMapVolumeSource{
									LocalObjectReference: apiv1.LocalObjectReference{
										Name: "entrypoint-nginx",
									},
								},
							},
						},
						{
							Name: "proto-files",
							VolumeSource: apiv1.VolumeSource{
								ConfigMap: &apiv1.ConfigMapVolumeSource{
									LocalObjectReference: apiv1.LocalObjectReference{
										Name: "entrypoint-protofiles",
									},
								},
							},
						},
					},
				},
			},
		},
	})
}

func (k *ResourceManagerService) activateEntrypointService(name, namespace, label string) (*apiv1.Service, error) {
	k.logger.Info(fmt.Sprintf("Updating service in %s named %s", namespace, name))

	serviceLabels := map[string]string{
		"app":          name,
		"version-name": label,
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
