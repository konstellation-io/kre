package version

import (
	"context"
	"errors"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"

	"github.com/konstellation-io/kre/k8s-manager/entity"
	"github.com/konstellation-io/kre/k8s-manager/proto/versionpb"
)

var (
	// ErrDeleteConfigmapTimeout when deleting configmap timeout.
	ErrDeleteConfigmapTimeout = errors.New("timeout deleting config maps")

	// ErrDeleteDeploymentTimeout when deleting deployment timeout.
	ErrDeleteDeploymentTimeout = errors.New("timeout deleting deployments")

	// ErrRestartingPodsTimeout  when restarting pods timeout.
	ErrRestartingPodsTimeout = errors.New("timeout restarting pods")
)

type WorkflowConfig map[string]NodeConfig

type NodeConfig map[string]string

func (m *Manager) generateNodeConfig(version *entity.Version, workflow *versionpb.Version_Workflow) WorkflowConfig {
	wconf := WorkflowConfig{}

	for _, n := range workflow.Nodes {
		wconf[n.Id] = NodeConfig{
			"KRT_VERSION":           version.Name,
			"KRT_NODE_NAME":         n.Name,
			"KRT_NATS_SERVER":       "kre-nats:4222",
			"KRT_NATS_MONGO_WRITER": "mongo_writer",
			"KRT_BASE_PATH":         "/krt-files",
			"KRT_HANDLER_PATH":      n.Src,
			"KRT_MONGO_URI":         version.MongoUri,
			"KRT_MONGO_DB_NAME":     version.MongoDbName,
		}
	}

	for _, e := range workflow.Edges {
		fromNode := wconf[e.FromNode]
		toNode := wconf[e.ToNode]

		fromNode["KRT_NATS_OUTPUT"] = e.Id
		toNode["KRT_NATS_INPUT"] = e.Id
	}

	var (
		firstNode NodeConfig
		lastNode  NodeConfig
	)

	totalEdges := len(workflow.Edges)

	if totalEdges == 0 {
		firstNode = wconf[workflow.Nodes[0].Id]
		lastNode = wconf[workflow.Nodes[0].Id]
	} else {
		firstNode = wconf[workflow.Edges[0].FromNode]
		lastNode = wconf[workflow.Edges[len(workflow.Edges)-1].ToNode]
	}

	// First node input is the workflow entrypoint
	firstNode["KRT_NATS_INPUT"] = fmt.Sprintf("%s-%s-entrypoint", version.Name, workflow.Entrypoint)

	// Last node output is empty to reply to entrypoint
	lastNode["KRT_NATS_OUTPUT"] = ""

	return wconf
}

func (m *Manager) createNode(
	version *entity.Version,
	node *versionpb.Version_Workflow_Node,
	nodeConfig NodeConfig,
	workflow *versionpb.Version_Workflow,
) error {
	configName, err := m.createNodeConfigMap(version, node, nodeConfig)
	if err != nil {
		return err
	}

	_, err = m.createNodeDeployment(version, node, configName, workflow)

	return err
}

func (m *Manager) createNodeConfigMap(
	version *entity.Version,
	node *versionpb.Version_Workflow_Node,
	config NodeConfig,
) (string, error) {
	name := fmt.Sprintf("%s-%s-%s", version.Name, node.Name, node.Id)
	ns := version.Namespace
	nodeConfig, err := m.clientset.CoreV1().ConfigMaps(ns).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: ns,
			Labels: map[string]string{
				"type":         "node",
				"version-name": version.Name,
				"node-name":    node.Name,
				"node-id":      node.Id,
			},
		},
		Data: config,
	})

	if err != nil {
		return "", err
	}

	return nodeConfig.Name, nil
}

func (m *Manager) createNodeDeployment(
	version *entity.Version,
	node *versionpb.Version_Workflow_Node,
	configName string,
	workflow *versionpb.Version_Workflow,
) (*appsv1.Deployment, error) {
	name := fmt.Sprintf("%s-%s-%s", version.Name, node.Name, node.Id)
	ns := version.Namespace
	m.logger.Info(fmt.Sprintf("Creating node deployment in %s named %s from image %s", ns, name, node.Image))

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
			Value: workflow.GetName(),
		},
		{
			Name:  "KRT_WORKFLOW_ID",
			Value: workflow.GetId(),
		},
		{
			Name:  "KRT_NODE_NAME",
			Value: node.GetName(),
		},
		{
			Name:  "KRT_NODE_ID",
			Value: node.GetId(),
		},
	}

	return m.clientset.AppsV1().Deployments(ns).Create(&appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: ns,
			Labels: map[string]string{
				"type":         "node",
				"version-name": version.Name,
				"node-name":    node.Name,
				"node-id":      node.Id,
			},
		},
		Spec: appsv1.DeploymentSpec{
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"type":         "node",
					"version-name": version.Name,
					"node-name":    node.Name,
					"node-id":      node.Id,
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"type":         "node",
						"version-name": version.Name,
						"node-name":    node.Name,
						"node-id":      node.Id,
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:            name,
							Image:           node.Image,
							ImagePullPolicy: apiv1.PullIfNotPresent,
							Env:             envVars,
							EnvFrom: []apiv1.EnvFromSource{
								{
									ConfigMapRef: &apiv1.ConfigMapEnvSource{
										LocalObjectReference: apiv1.LocalObjectReference{
											Name: configName,
										},
									},
								},
								{
									ConfigMapRef: &apiv1.ConfigMapEnvSource{
										LocalObjectReference: apiv1.LocalObjectReference{
											Name: fmt.Sprintf("%s-conf-files", version.Name),
										},
									},
								},
								{
									ConfigMapRef: &apiv1.ConfigMapEnvSource{
										LocalObjectReference: apiv1.LocalObjectReference{
											Name: fmt.Sprintf("%s-global", version.Name),
										},
									},
								},
							},
							VolumeMounts: []apiv1.VolumeMount{
								{
									Name:      "shared-data",
									ReadOnly:  true,
									MountPath: "/krt-files",
									SubPath:   version.Name,
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
										Name: fmt.Sprintf("%s-conf-files", version.Name),
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

func (m *Manager) restartPodsSync(ctx context.Context, version *entity.Version) error {
	ns := version.Namespace
	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	}

	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", version.Name),
		TypeMeta: metav1.TypeMeta{
			Kind: "Pod",
		},
	}

	pods := m.clientset.CoreV1().Pods(ns)

	list, err := pods.List(listOptions)
	if err != nil {
		return err
	}

	numPods := len(list.Items)

	m.logger.Infof("There are %d PODs to delete", numPods)

	if numPods == 0 {
		return nil
	}

	w, err := pods.Watch(listOptions)
	if err != nil {
		return err
	}

	watchResults := w.ResultChan()

	err = pods.DeleteCollection(deleteOptions, listOptions)
	if err != nil {
		return err
	}

	// We are going to delete N PODs, so after the deletion N PODs will be recreated again.
	// This algorithm counts the number of times that we receive a "MODIFIED" event with status phase "Running".
	// We should received modification events for the current PODs and for the new ones.
	numOfEvents := 0
	expectedNumOfEvents := numPods * 2

	for {
		select {
		case event := <-watchResults:
			pod := event.Object.(*apiv1.Pod)

			if event.Type == watch.Modified && pod.Status.Phase == apiv1.PodRunning {
				numOfEvents++
				if numOfEvents == expectedNumOfEvents {
					m.logger.Infof("All PODs for version '%s' has been restarted", version.Name)
					w.Stop()

					return nil
				}
			}

		case <-ctx.Done():
			w.Stop()

			return ErrRestartingPodsTimeout
		}
	}
}

func (m *Manager) deleteDeploymentsSync(ctx context.Context, version *entity.Version) error {
	ns := version.Namespace
	gracePeriod := new(int64)
	*gracePeriod = 0

	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", version.Name),
		TypeMeta: metav1.TypeMeta{
			Kind: "Deployment",
		},
	}

	deployments := m.clientset.AppsV1().Deployments(ns)

	list, err := deployments.List(listOptions)
	if err != nil {
		return err
	}

	numDeployments := len(list.Items)

	m.logger.Infof("There are %d deployments to delete", numDeployments)

	if numDeployments == 0 {
		return nil
	}

	w, err := deployments.Watch(listOptions)
	if err != nil {
		return err
	}

	watchResults := w.ResultChan()

	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	}

	deploymentsToDelete := make(map[string]bool)
	for _, d := range list.Items {
		deploymentsToDelete[d.Name] = true

		m.logger.Infof("Deleting deployment '%s'...", d.Name)

		err = deployments.Delete(d.Name, deleteOptions)
		if err != nil {
			return err
		}
	}

	// In order to delete the Deployments is mandatory to delete theirs associated PODs because
	// the "Deleted" event of a deployment is not received until their PODs are deleted.
	pods := m.clientset.CoreV1().Pods(ns)
	deletePodsPolicy := metav1.DeletePropagationBackground
	deleteOptions.PropagationPolicy = &deletePodsPolicy
	podList, _ := pods.List(metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", version.Name),
		TypeMeta: metav1.TypeMeta{
			Kind: "Pod",
		},
	})

	m.logger.Infof("There are %d PODs to delete", len(podList.Items))

	for _, p := range podList.Items {
		_ = pods.Delete(p.Name, deleteOptions)
	}

	for {
		select {
		case event := <-watchResults:
			if event.Type == watch.Deleted {
				if d, ok := event.Object.(*appsv1.Deployment); ok {
					// Check if the deleted object is one of the deployments to delete
					if _, ok := deploymentsToDelete[d.Name]; ok {
						m.logger.Infof("Deployment '%s' deleted", d.Name)

						numDeployments--

						if numDeployments == 0 {
							w.Stop()

							return nil
						}
					}
				}
			}

		case <-ctx.Done():
			w.Stop()

			return ErrDeleteDeploymentTimeout
		}
	}
}

func (m *Manager) deleteConfigMapsSync(ctx context.Context, version *entity.Version) error {
	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	}

	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", version.Name),
		TypeMeta: metav1.TypeMeta{
			Kind: "ConfigMap",
		},
	}

	configMaps := m.clientset.CoreV1().ConfigMaps(version.Namespace)

	list, err := configMaps.List(listOptions)
	if err != nil {
		return err
	}

	numConfigMaps := len(list.Items)

	m.logger.Infof("There are %d configmaps to delete", numConfigMaps)

	if numConfigMaps == 0 {
		return nil
	}

	w, err := configMaps.Watch(listOptions)
	if err != nil {
		return err
	}

	watchResults := w.ResultChan()

	configmapNamesToDelete := make(map[string]bool)

	for _, c := range list.Items {
		configmapNamesToDelete[c.Name] = true

		m.logger.Infof("Deleting configmap '%s'...", c.Name)

		err = configMaps.Delete(c.Name, deleteOptions)
		if err != nil {
			return err
		}
	}

	for {
		select {
		case event := <-watchResults:
			if event.Type == watch.Deleted {
				if c, ok := event.Object.(*apiv1.ConfigMap); ok {
					// Check if the deleted object is one of the configmaps to delete
					if _, ok := configmapNamesToDelete[c.Name]; ok {
						m.logger.Infof("Configmap '%s' deleted", c.Name)

						numConfigMaps--

						if numConfigMaps == 0 {
							w.Stop()

							return nil
						}
					}
				}
			}

		case <-ctx.Done():
			w.Stop()

			return ErrDeleteConfigmapTimeout
		}
	}
}
