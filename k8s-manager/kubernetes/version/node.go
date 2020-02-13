package version

import (
	"errors"
	"fmt"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/proto/versionpb"
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
			"KRT_NATS_MONGO_WRITER": "some_channel",
			"KRT_BASE_PATH":         "/krt-files",
			"KRT_HANDLER_PATH":      n.Src,
		}
	}

	for _, e := range workflow.Edges {
		fromNode := wconf[e.FromNode]
		toNode := wconf[e.ToNode]

		fromNode["KRT_NATS_OUTPUT"] = e.Id
		toNode["KRT_NATS_INPUT"] = e.Id
	}

	var firstNode NodeConfig
	var lastNode NodeConfig
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

func (m *Manager) createNode(version *entity.Version, node *versionpb.Version_Workflow_Node, nodeConfig NodeConfig) error {
	configName, err := m.createNodeConfigMap(version, node, nodeConfig)
	if err != nil {
		return err
	}

	_, err = m.createNodeDeployment(version, node, configName)
	return err
}

func (m *Manager) createNodeConfigMap(version *entity.Version, node *versionpb.Version_Workflow_Node, config NodeConfig) (string, error) {
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

func (m *Manager) createNodeDeployment(version *entity.Version, node *versionpb.Version_Workflow_Node, configName string) (*appsv1.Deployment, error) {
	name := fmt.Sprintf("%s-%s-%s", version.Name, node.Name, node.Id)
	ns := version.Namespace
	m.logger.Info(fmt.Sprintf("Creating node deployment in %s named %s from image %s", ns, name, node.Image))

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
							Env: []apiv1.EnvVar{
								{
									Name:  "KRE_VERSION_NAME",
									Value: version.Name,
								},
								{
									Name:  "KRE_NODE_NAME",
									Value: node.Name,
								},
								{
									Name:  "KRE_NODE_ID",
									Value: node.Id,
								},
							},
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
							Env: []apiv1.EnvVar{
								{
									Name:  "KRE_VERSION_NAME",
									Value: version.Name,
								},
								{
									Name:  "KRE_NODE_NAME",
									Value: node.Name,
								},
								{
									Name:  "KRE_NODE_ID",
									Value: node.Id,
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

// FIXME Restart Pod Sync Is not waiting for ready state of PODs
func (m *Manager) restartPodsSync(version *entity.Version) error {
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

	if numPods == 0 {
		return nil
	}

	err = pods.DeleteCollection(deleteOptions, listOptions)
	if err != nil {
		return err
	}

	startTime := time.Now()
	timeToWait := 3 * time.Minute
	w, err := pods.Watch(listOptions)
	if err != nil {
		return err
	}

	watchResults := w.ResultChan()
	for {
		select {
		case event := <-watchResults:
			pod := event.Object.(*apiv1.Pod)

			if pod.Status.Phase == apiv1.PodRunning {
				numPods = numPods - 1
				if numPods == 0 {
					w.Stop()
					return nil
				}
			}

		case <-time.After(timeToWait - time.Since(startTime)):
			w.Stop()
			return errors.New("timeout restarting pods")
		}
	}
}

// TODO try to reuse code
func (m *Manager) deleteDeploymentsSync(version *entity.Version) error {
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

	if numDeployments == 0 {
		return nil
	}

	startTime := time.Now()
	timeToWait := 5 * time.Minute
	w, err := deployments.Watch(listOptions)
	if err != nil {
		return err
	}
	watchResults := w.ResultChan()

	go func() {
		deletePolicy := metav1.DeletePropagationForeground
		deleteOptions := &metav1.DeleteOptions{
			PropagationPolicy:  &deletePolicy,
			GracePeriodSeconds: gracePeriod,
		}
		for _, d := range list.Items {
			_ = deployments.Delete(d.Name, deleteOptions)
		}

		time.Sleep(2 * time.Second)
		m.logger.Info("Forcing POD deletion")
		pods := m.clientset.CoreV1().Pods(ns)
		listOptions := metav1.ListOptions{
			LabelSelector: fmt.Sprintf("version-name=%s", version.Name),
			TypeMeta: metav1.TypeMeta{
				Kind: "Pod",
			},
		}
		deletePodsPolicy := metav1.DeletePropagationBackground
		deleteOptions.PropagationPolicy = &deletePodsPolicy
		list, _ := pods.List(listOptions)
		for _, p := range list.Items {
			_ = pods.Delete(p.Name, deleteOptions)
		}
	}()

	for {
		select {
		case event := <-watchResults:
			if event.Type == watch.Deleted {
				numDeployments = numDeployments - 1
				if numDeployments == 0 {
					w.Stop()
					return nil
				}
			}

		case <-time.After(timeToWait - time.Since(startTime)):
			w.Stop()
			return errors.New("timeout deleting deployments")
		}
	}
}

// TODO try to reuse code
func (m *Manager) deleteConfigMapsSync(version *entity.Version) error {
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

	if numConfigMaps == 0 {
		return nil
	}

	for _, c := range list.Items {
		fmt.Printf("Deleting %s", c.Name)
		_ = configMaps.Delete(c.Name, deleteOptions)
		if err != nil {
			return err
		}
	}

	startTime := time.Now()
	timeToWait := 2 * time.Minute
	w, err := configMaps.Watch(listOptions)
	if err != nil {
		return err
	}

	watchResults := w.ResultChan()
	for {
		select {
		case event := <-watchResults:
			if event.Type == watch.Deleted {
				fmt.Printf("Deleted %#v", event.Object)
				numConfigMaps = numConfigMaps - 1
				if numConfigMaps == 0 {
					w.Stop()
					return nil
				}
			}

		case <-time.After(timeToWait - time.Since(startTime)):
			w.Stop()
			return errors.New("timeout deleting config maps")
		}
	}
}
