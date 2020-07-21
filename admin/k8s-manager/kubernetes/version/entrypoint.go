package version

import (
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"

	"github.com/konstellation-io/kre/admin/k8s-manager/entity"
)

type EntrypointConfig map[string]interface{}

func (m *Manager) generateEntrypointConfig(version *entity.Version, wconf map[string]WorkflowConfig) EntrypointConfig {
	natsSubjects := map[string]interface{}{}

	for _, w := range version.Workflows {
		firstNodeID := w.Nodes[0].Id
		node := wconf[w.Name][firstNodeID]
		natsSubjects[w.Entrypoint] = node["KRT_NATS_INPUT"]
	}

	return EntrypointConfig{
		"nats-subjects": natsSubjects,
	}
}

func (m *Manager) createEntrypoint(version *entity.Version) error {
	m.logger.Info("Creating entrypoint configmap")

	_, err := m.createEntrypointConfigMap(version)
	if err != nil {
		return err
	}

	m.logger.Info("Creating entrypoint deployment")
	_, err = m.createEntrypointDeployment(version)

	return err
}

func (m *Manager) createEntrypointConfigMap(version *entity.Version) (*apiv1.ConfigMap, error) {
	name := version.Name
	ns := version.Namespace

	return m.clientset.CoreV1().ConfigMaps(ns).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name: fmt.Sprintf("%s-entrypoint-env", name),
			Labels: map[string]string{
				"type":         "entrypoint",
				"version-name": name,
			},
		},
		Data: map[string]string{
			"KRT_NATS_SERVER":        "kre-nats:4222",
			"KRT_NATS_SUBJECTS_FILE": "/src/conf/nats_subject.json",
		},
	})
}

// nolint: funlen
// this function is not complex, just long due to the object definition.
func (m *Manager) createEntrypointDeployment(version *entity.Version) (*appsv1.Deployment, error) {
	name := version.Name
	ns := version.Namespace
	entrypointImage := version.Entrypoint.Image

	m.logger.Info(fmt.Sprintf("Creating entrypoint deployment in %s named %s from image %s", ns, name, entrypointImage))

	envVars := []apiv1.EnvVar{
		{
			Name:  "KRT_VERSION_ID",
			Value: version.GetId(),
		},
		{
			Name:  "KRT_VERSION",
			Value: version.GetName(),
		},
		{
			Name:  "KRT_WORKFLOW_NAME",
			Value: "entrypoint",
		},
		{
			Name:  "KRT_WORKFLOW_ID",
			Value: "entrypoint",
		},
		{
			Name:  "KRT_NODE_NAME",
			Value: "entrypoint",
		},
		{
			Name:  "KRT_NODE_ID",
			Value: "entrypoint",
		},
	}

	return m.clientset.AppsV1().Deployments(ns).Create(&appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      fmt.Sprintf("%s-entrypoint", name),
			Namespace: ns,
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
						"node-name":    "entrypoint",
						"node-id":      "entrypoint",
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
									Name:      "shared-data",
									ReadOnly:  false,
									MountPath: "/data",
									SubPath:   version.Name + "/data",
								},
								{
									Name:      "app-log-volume",
									MountPath: "/var/log/app",
								},
							},
							Env: envVars,
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
							Env: envVars,
							VolumeMounts: []apiv1.VolumeMount{
								{
									Name:      "version-conf-files",
									ReadOnly:  true,
									MountPath: "/fluent-bit/etc/fluent-bit.conf",
									SubPath:   "fluent-bit.conf",
								},
								{
									Name:      "version-conf-files",
									ReadOnly:  true,
									MountPath: "/fluent-bit/etc/parsers.conf",
									SubPath:   "parsers.conf",
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
									MountPath: fmt.Sprintf("/proto/%s", version.Entrypoint.ProtoFile),
									SubPath:   fmt.Sprintf("%s/%s", name, version.Entrypoint.ProtoFile),
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
									ReadOnly:  false,
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

func (m *Manager) deleteEntrypointService(version *entity.Version) error {
	name := version.Name
	ns := version.Namespace
	m.logger.Info(fmt.Sprintf("Deleting service in %s named %s", ns, name))

	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground

	return m.clientset.CoreV1().Services(ns).Delete("active-entrypoint", &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	})
}

func (m *Manager) createEntrypointService(version *entity.Version) (*apiv1.Service, error) {
	name := version.Name
	ns := version.Namespace
	m.logger.Info(fmt.Sprintf("Updating service in %s named %s", ns, name))

	serviceLabels := map[string]string{
		"type":         "entrypoint",
		"version-name": name,
	}

	existingService, err := m.clientset.CoreV1().Services(ns).Get("active-entrypoint", metav1.GetOptions{})

	if errors.IsNotFound(err) {
		return m.clientset.CoreV1().Services(ns).Create(&apiv1.Service{
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
	}

	if err != nil {
		return nil, err
	}

	existingService.ObjectMeta.Labels = serviceLabels
	existingService.Spec.Selector = serviceLabels

	return m.clientset.CoreV1().Services(ns).Update(existingService)
}
