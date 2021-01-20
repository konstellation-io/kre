package version

import (
	"context"
	"errors"
	"fmt"

	"github.com/konstellation-io/kre/engine/k8s-manager/proto/versionpb"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
)

type WaitForKind = int

const (
	WaitForDeployments WaitForKind = iota
	WaitForConfigMaps
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

func getFirstNodeNATSInput(versionName, workflowEntrypoint string) string {
	return fmt.Sprintf("%s-%s-entrypoint", versionName, workflowEntrypoint)
}

func (m *Manager) createAllNodeDeployments(req *versionpb.StartRequest) error {
	m.logger.Infof("Creating deployments for all nodes")

	for _, w := range req.Workflows {
		workflowConfig := m.generateWorkflowConfig(req, w)

		for _, n := range w.Nodes {
			err := m.createNodeDeployment(req, n, workflowConfig[n.Id])
			if err != nil {
				return err
			}

			m.logger.Infof("Created deployment for node \"%s\"", n.Name)
		}
	}

	return nil
}

func (m *Manager) generateWorkflowConfig(req *versionpb.StartRequest, workflow *versionpb.Workflow) WorkflowConfig {
	m.logger.Infof("Generating workflow \"%s\" config", workflow.Name)

	wconf := WorkflowConfig{}

	for _, n := range workflow.Nodes {
		wconf[n.Id] = NodeConfig{
			"KRT_WORKFLOW_ID":       workflow.GetId(),
			"KRT_WORKFLOW_NAME":     workflow.GetName(),
			"KRT_NODE_ID":           n.GetId(),
			"KRT_NODE_NAME":         n.GetName(),
			"KRT_HANDLER_PATH":      n.Src,
			"KRT_NATS_MONGO_WRITER": natsMongoWriterSubject,
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
	firstNode["KRT_NATS_INPUT"] = getFirstNodeNATSInput(req.GetVersionName(), workflow.Entrypoint)

	// Last node output is empty to reply to entrypoint
	lastNode["KRT_NATS_OUTPUT"] = ""

	return wconf
}

func (m *Manager) getNodeEnvVars(req *versionpb.StartRequest, cfg NodeConfig) []apiv1.EnvVar {
	envVars := make([]apiv1.EnvVar, len(cfg))
	i := 0

	for k, v := range cfg {
		envVars[i] = apiv1.EnvVar{
			Name:  k,
			Value: v,
		}
		i++
	}

	return append(m.getCommonEnvVars(req), envVars...)
}

func (m *Manager) getNodeLabels(versionName string, node *versionpb.Workflow_Node) map[string]string {
	return map[string]string{
		"type":         "node",
		"version-name": versionName,
		"node-name":    node.Name,
		"node-id":      node.Id,
	}
}

func (m *Manager) getNodeResourcesRequirements(isGPUEnabled bool) apiv1.ResourceRequirements {
	requests := apiv1.ResourceList{}
	limits := apiv1.ResourceList{}

	if isGPUEnabled {
		limits["nvidia.com/gpu"] = resource.MustParse("1")
		requests["nvidia.com/gpu"] = resource.MustParse("1")
	}

	return apiv1.ResourceRequirements{
		Limits:   limits,
		Requests: requests,
	}
}

func (m *Manager) createNodeDeployment(
	req *versionpb.StartRequest,
	node *versionpb.Workflow_Node,
	config NodeConfig,
) error {
	versionName := req.VersionName
	ns := req.K8SNamespace
	name := fmt.Sprintf("%s-%s-%s", versionName, node.Name, node.Id)
	envVars := m.getNodeEnvVars(req, config)
	labels := m.getNodeLabels(req.VersionName, node)

	m.logger.Infof("Creating node deployment with name \"%s\" and image \"%s\"", name, node.Image)

	_, err := m.clientset.AppsV1().Deployments(ns).Create(&appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
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
							Name:            name,
							Image:           node.Image,
							ImagePullPolicy: apiv1.PullIfNotPresent,
							Env:             envVars,
							VolumeMounts: []apiv1.VolumeMount{
								m.getKRTFilesVolumeMount(),
								m.getAppLogVolumeMount(),
							},
							Resources: m.getNodeResourcesRequirements(node.Gpu),
						},
						m.getFluentBitContainer(envVars),
					},
					Volumes: m.getCommonVolumes(versionName),
				},
			},
		},
	})

	return err
}

func (m *Manager) restartPodsSync(ctx context.Context, versionName, ns string) error {
	gracePeriodZero := int64(0)
	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: &gracePeriodZero,
	}

	listOptions := metav1.ListOptions{
		LabelSelector: m.getVersionNameLabelSelector(versionName),
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
					m.logger.Infof("All PODs for version '%s' has been restarted", versionName)
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

func (m *Manager) getVersionNameLabelSelector(versionName string) string {
	return fmt.Sprintf("version-name=%s", versionName)
}

func (m *Manager) deleteDeploymentsSync(ctx context.Context, versionName, ns string) error {
	deployments := m.clientset.AppsV1().Deployments(ns)

	listOptions := metav1.ListOptions{
		LabelSelector: m.getVersionNameLabelSelector(versionName),
		TypeMeta: metav1.TypeMeta{
			Kind: "Deployment",
		},
	}

	list, err := deployments.List(listOptions)
	if err != nil {
		return err
	}

	numDeployments := len(list.Items)
	if numDeployments == 0 {
		return nil
	}

	m.logger.Infof("There are %d deployments to delete", numDeployments)

	gracePeriodZero := int64(0)
	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: &gracePeriodZero,
	}

	for i := range list.Items {
		d := list.Items[i]

		m.logger.Infof("Deleting deployment '%s'...", d.Name)

		err = deployments.Delete(d.Name, deleteOptions)
		if err != nil {
			return err
		}
	}

	m.deleteDeploymentPODs(ns, deleteOptions, versionName)

	w, err := deployments.Watch(listOptions)
	if err != nil {
		return err
	}

	return m.waitForDeletions(ctx, w, numDeployments, WaitForDeployments)
}

// In order to delete the Deployments is mandatory to delete theirs associated PODs because
// the "Deleted" event of a deployment is not received until their PODs are deleted.
func (m *Manager) deleteDeploymentPODs(ns string, deleteOptions *metav1.DeleteOptions, versionName string) {
	pods := m.clientset.CoreV1().Pods(ns)
	deletePodsPolicy := metav1.DeletePropagationBackground
	deleteOptions.PropagationPolicy = &deletePodsPolicy
	podList, _ := pods.List(metav1.ListOptions{
		LabelSelector: m.getVersionNameLabelSelector(versionName),
		TypeMeta: metav1.TypeMeta{
			Kind: "Pod",
		},
	})

	m.logger.Infof("There are %d PODs to delete", len(podList.Items))

	for i := range podList.Items {
		_ = pods.Delete(podList.Items[i].Name, deleteOptions)
	}
}

func (m *Manager) deleteConfigMapsSync(ctx context.Context, versionName, ns string) error {
	listOptions := metav1.ListOptions{
		LabelSelector: m.getVersionNameLabelSelector(versionName),
		TypeMeta: metav1.TypeMeta{
			Kind: "ConfigMap",
		},
	}

	configMaps := m.clientset.CoreV1().ConfigMaps(ns)

	list, err := configMaps.List(listOptions)
	if err != nil {
		return err
	}

	numConfigMaps := len(list.Items)
	if numConfigMaps == 0 {
		return nil
	}

	m.logger.Infof("There are %d configmaps to delete", numConfigMaps)

	gracePeriodZero := int64(0)
	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: &gracePeriodZero,
	}

	for i := range list.Items {
		c := list.Items[i]

		m.logger.Infof("Deleting configmap '%s'...", c.Name)

		err = configMaps.Delete(c.Name, deleteOptions)
		if err != nil {
			return err
		}
	}

	w, err := configMaps.Watch(listOptions)
	if err != nil {
		return err
	}

	return m.waitForDeletions(ctx, w, numConfigMaps, WaitForConfigMaps)
}

func (m *Manager) waitForDeletions(
	ctx context.Context,
	watcher watch.Interface,
	numberOfDeletions int,
	kind WaitForKind,
) error {
	watchResults := watcher.ResultChan()

	for {
		select {
		case event := <-watchResults:
			if event.Type != watch.Deleted {
				continue
			}

			switch kind {
			case WaitForConfigMaps:
				c := event.Object.(*apiv1.ConfigMap)
				m.logger.Infof("Configmap '%s' deleted", c.Name)
			case WaitForDeployments:
				d := event.Object.(*appsv1.Deployment)
				m.logger.Infof("Deployment '%s' deleted", d.Name)
			}

			numberOfDeletions--
			if numberOfDeletions == 0 {
				watcher.Stop()

				return nil
			}

		case <-ctx.Done():
			watcher.Stop()

			switch kind {
			case WaitForConfigMaps:
				return ErrDeleteConfigmapTimeout
			case WaitForDeployments:
				return ErrDeleteDeploymentTimeout
			}
		}
	}
}
