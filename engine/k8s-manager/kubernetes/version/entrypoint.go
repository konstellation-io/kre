package version

import (
	"encoding/json"
	"fmt"

	"github.com/konstellation-io/kre/engine/k8s-manager/proto/versionpb"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

type EntrypointConfig map[string]interface{}

func (m *Manager) getEntrypointEnvVars(req *versionpb.StartRequest) []apiv1.EnvVar {
	entrypointEnvVars := []apiv1.EnvVar{
		{Name: "KRT_NATS_SUBJECTS_FILE", Value: natsSubjectsFilePath},
		{Name: "KRT_WORKFLOW_NAME", Value: "entrypoint"},
		{Name: "KRT_WORKFLOW_ID", Value: "entrypoint"},
		{Name: "KRT_NODE_NAME", Value: "entrypoint"},
		{Name: "KRT_NODE_ID", Value: "entrypoint"},
		// Time to wait for a message to do a round trip through a workflow.
		{Name: "KRT_REQUEST_TIMEOUT", Value: m.config.Entrypoint.RequestTimeout},
	}

	return append(m.getCommonEnvVars(req), entrypointEnvVars...)
}

// generateNATSSubjects creates a JSON containing the NATS input subjects of each workflow like:
//   {
//      "Workflow1": "version1-Workflow1-entrypoint",
//      "Workflow2": "version1-Workflow2-entrypoint"
//   }
func (m *Manager) generateNATSSubjects(versionName string, workflows []*versionpb.Workflow) (string, error) {
	natsSubjects := map[string]string{}

	for _, w := range workflows {
		natsSubjects[w.Entrypoint] = getFirstNodeNATSInput(versionName, w.Entrypoint)
	}

	natsSubjectJSON, err := json.Marshal(natsSubjects)
	if err != nil {
		return "", err
	}

	ns := string(natsSubjectJSON)

	m.logger.Infof("NATS subjects generated: %s", ns)

	return ns, nil
}

func (m *Manager) getEntrypointLabels(versionName string) map[string]string {
	return map[string]string{
		"type":         "entrypoint",
		"version-name": versionName,
		"node-name":    "entrypoint",
		"node-id":      "entrypoint",
	}
}

func (m *Manager) createEntrypoint(req *versionpb.StartRequest) error {
	m.logger.Info("Creating entrypoint deployment")

	versionName := req.VersionName
	ns := m.config.Kubernetes.Namespace
	img := req.Entrypoint.Image
	proto := req.Entrypoint.ProtoFile
	envVars := m.getEntrypointEnvVars(req)
	labels := m.getEntrypointLabels(req.VersionName)

	m.logger.Info(fmt.Sprintf("Creating entrypoint deployment in %s named %s from image %s", ns, versionName, img))

	_, err := m.clientset.AppsV1().Deployments(ns).Create(&appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      fmt.Sprintf("%s-entrypoint", versionName),
			Namespace: ns,
			Labels:    labels,
		},
		Spec: appsv1.DeploymentSpec{
			Selector: &metav1.LabelSelector{
				MatchLabels: labels,
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: apiv1.PodSpec{
					InitContainers: []apiv1.Container{
						m.getKRTFilesDownloaderContainer(envVars),
					},
					Containers: []apiv1.Container{
						{
							Name:            versionName,
							Image:           img,
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
									MountPath: natsSubjectsFilePath,
									SubPath:   "nats_subject.json",
								},
								m.getKRTFilesVolumeMount(),
								m.getAppLogVolumeMount(),
							},
							Env: envVars,
						},
						m.getFluentBitContainer(envVars),
						{
							Name:            fmt.Sprintf("%s-web", versionName),
							Image:           "nginxinc/nginx-unprivileged:stable-alpine",
							ImagePullPolicy: apiv1.PullIfNotPresent,
							Ports: []apiv1.ContainerPort{
								{
									ContainerPort: 8080,
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
								m.getKRTFilesVolumeMount(),
								{
									Name:      basePathKRTName,
									ReadOnly:  true,
									MountPath: fmt.Sprintf("/proto/%s", proto),
									SubPath:   fmt.Sprintf("%s/%s", versionName, proto),
								},
							},
						},
					},
					Volumes: m.getCommonVolumes(versionName),
				},
			},
		},
	})

	return err
}

func (m *Manager) deleteEntrypointService(serviceName, ns string) error {
	deletePolicy := metav1.DeletePropagationForeground

	m.logger.Info(fmt.Sprintf("Delete service with name %s", serviceName))

	return m.clientset.CoreV1().Services(ns).Delete(serviceName, &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: new(int64),
	})
}

func (m *Manager) createEntrypointService(versionName, serviceName, ns string) (*apiv1.Service, error) {
	serviceLabels := map[string]string{
		"type":         "entrypoint",
		"version-name": versionName,
	}

	m.logger.Info(fmt.Sprintf("Creating service for version %s with serviceName %s", versionName, serviceName))

	existingService, err := m.clientset.CoreV1().Services(ns).Get(serviceName, metav1.GetOptions{})

	if errors.IsNotFound(err) {
		return m.clientset.CoreV1().Services(ns).Create(&apiv1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:   serviceName,
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
						TargetPort: intstr.IntOrString{IntVal: 8080},
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
