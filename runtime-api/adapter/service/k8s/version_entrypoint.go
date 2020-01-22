package k8s

import (
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
	return k.clientset.CoreV1().ConfigMaps(namespace).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name: fmt.Sprintf("%s-entrypoint-env", name),
			Labels: map[string]string{
				"type":         "entrypoint",
				"version-name": name,
			},
		},
		Data: map[string]string{
			"KRT_ENTRYPOINT":         path.Join("/krt-files", entrypoint.Src),
			"KRT_NATS_SERVER":        "kre-nats:4222",
			"KRT_NATS_SUBJECTS_FILE": "/src/conf/nats_subject.json",
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
									Name:      "version-conf-files",
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
								{
									Name:      "app-log-volume",
									MountPath: "/var/log/app",
								},
							},
							Env: []apiv1.EnvVar{
								{
									Name:  "KRE_VERSION_NAME",
									Value: name,
								},
							},
							EnvFrom: []apiv1.EnvFromSource{
								{
									ConfigMapRef: &apiv1.ConfigMapEnvSource{
										LocalObjectReference: apiv1.LocalObjectReference{
											Name: fmt.Sprintf("%s-entrypoint-env", name),
										},
									},
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
									Value: name,
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
									Name:      "version-conf-files",
									ReadOnly:  true,
									MountPath: "/etc/nginx/conf.d/default.conf",
									SubPath:   "default.conf",
								},
								{
									Name:      "shared-data",
									ReadOnly:  true,
									MountPath: fmt.Sprintf("/proto/%s", entrypoint.ProtoFile),
									SubPath:   fmt.Sprintf("%s/%s", name, entrypoint.ProtoFile),
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
										Name: fmt.Sprintf("%s-conf-files", name),
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

func (k *ResourceManagerService) deactivateEntrypointService(name, namespace, label string) error {
	k.logger.Info(fmt.Sprintf("Deleting service in %s named %s", namespace, name))

	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground

	err := k.clientset.CoreV1().Services(namespace).Delete("active-entrypoint", &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	})

	return err
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
