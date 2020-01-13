package k8s

import (
	"encoding/json"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"path"
)

func (k *ResourceManagerService) createEntrypointConfigmap(name, namespace string, entrypoint *entity.Entrypoint) (*apiv1.ConfigMap, error) {
	natsSubject, err := json.Marshal(entrypoint.Config["nats-subjects"])
	if err != nil {
		return nil, err
	}
	_, err = k.clientset.CoreV1().ConfigMaps(namespace).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name: fmt.Sprintf("%s-entrypoint-conf", name),
			Labels: map[string]string{
				"type":         "entrypoint",
				"version-name": name,
			},
		},
		Data: map[string]string{
			"KRT_ENTRYPOINT":         path.Join("/krt-files", entrypoint.Src),
			"KRT_NATS_SERVER":        "kre-nats:4222",
			"KRT_NATS_SUBJECTS_FILE": "/src/conf/nats_subject.json",
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
			"nats_subject.json": string(natsSubject),
		},
	})
	if err != nil {
		return nil, err
	}

	// TODO: Read proto files from Minio
	return k.clientset.CoreV1().ConfigMaps(namespace).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name: fmt.Sprintf("%s-entrypoint-protofiles", name),
			Labels: map[string]string{
				"type":         "entrypoint",
				"version-name": name,
			},
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

func (k *ResourceManagerService) createEntrypointDeployment(name, namespace string, entrypoint *entity.Entrypoint) (*appsv1.Deployment, error) {
	entrypointImage := entrypoint.Image

	k.logger.Info(fmt.Sprintf("Creating entrypoint deployment in %s named %s from image %s", namespace, name, entrypointImage))

	return k.clientset.AppsV1().Deployments(namespace).Create(&appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      fmt.Sprintf("%s-entrypoint", name),
			Namespace: namespace,
			Labels: map[string]string{
				"type":         "entrypoint",
				"version-name": name,
			},
		},
		Spec: appsv1.DeploymentSpec{
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"type":         "entrypoint",
					"version-name": name,
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"type":         "entrypoint",
						"version-name": name,
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
							VolumeMounts: []apiv1.VolumeMount{
								{
									Name:      "entrypoint-conf",
									ReadOnly:  true,
									MountPath: "/src/conf/nats_subject.json",
									SubPath:   "nats_subject.json",
								},
								{
									Name:      "shared-data",
									ReadOnly:  true,
									MountPath: "/krt-files",
									SubPath:   name,
								},
							},
							EnvFrom: []apiv1.EnvFromSource{
								{
									ConfigMapRef: &apiv1.ConfigMapEnvSource{
										LocalObjectReference: apiv1.LocalObjectReference{
											Name: fmt.Sprintf("%s-entrypoint-conf", name),
										},
									},
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
									Name:      "entrypoint-conf",
									ReadOnly:  true,
									MountPath: "/etc/nginx/conf.d/nginx.conf",
									SubPath:   "nginx.conf",
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
							Name: "entrypoint-conf",
							VolumeSource: apiv1.VolumeSource{
								ConfigMap: &apiv1.ConfigMapVolumeSource{
									LocalObjectReference: apiv1.LocalObjectReference{
										Name: fmt.Sprintf("%s-entrypoint-conf", name),
									},
								},
							},
						},
						{
							Name: "proto-files",
							VolumeSource: apiv1.VolumeSource{
								ConfigMap: &apiv1.ConfigMapVolumeSource{
									LocalObjectReference: apiv1.LocalObjectReference{
										Name: fmt.Sprintf("%s-entrypoint-protofiles", name),
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
					},
				},
			},
		},
	})
}

func (k *ResourceManagerService) activateEntrypointService(name, namespace, label string) (*apiv1.Service, error) {
	k.logger.Info(fmt.Sprintf("Updating service in %s named %s", namespace, name))

	serviceLabels := map[string]string{
		"type":         "entrypoint",
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
