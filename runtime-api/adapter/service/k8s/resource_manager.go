package k8s

import (
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type ResourceManagerService struct {
	cfg       *config.Config
	logger    logging.Logger
	clientset *kubernetes.Clientset
}

func NewResourceManagerService(cfg *config.Config, logger logging.Logger) *ResourceManagerService {
	clientset := newClientset(cfg)

	return &ResourceManagerService{
		cfg,
		logger,
		clientset,
	}
}

func (k *ResourceManagerService) CreateEntrypoint(version *entity.Version) error {
	name := strcase.ToKebab(version.Name)
	namespace := k.cfg.Kubernetes.Namespace
	entrypoint := &version.Entrypoint

	natsSubjects := map[string]string{}

	for _, w := range version.Workflows {
		natsSubjects[w.Entrypoint] = w.Nodes[0].Config["KRT_NATS_INPUT"]
	}

	k.logger.Info("Creating configmap")
	entrypoint.Config = map[string]interface{}{
		"nats-subjects": natsSubjects,
	}

	_, err := k.createEntrypointConfigmap(name, namespace, entrypoint)

	k.logger.Info("Creating entrypoint deployment")
	_, err = k.createEntrypointDeployment(name, namespace, entrypoint)

	return err
}

func (k *ResourceManagerService) CreateNode(version *entity.Version, node *entity.Node, versionConfig string) error {
	namespace := k.cfg.Kubernetes.Namespace

	nodeConfig, err := k.createNodeConfigmap(namespace, version, node)
	if err != nil {
		return err
	}

	_, err = k.createNodeDeployment(namespace, version, node, *nodeConfig, versionConfig)
	return err
}

func (k *ResourceManagerService) CreateVersionConfig(version *entity.Version) (*string, error) {
	namespace := k.cfg.Kubernetes.Namespace

	versionConfig, err := k.createVersionConfigmap(namespace, version)

	if err != nil {
		return nil, err
	}

	return &versionConfig.Name, nil
}

func (k *ResourceManagerService) StopVersion(name string) error {
	label := strcase.ToKebab(name)
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info(fmt.Sprintf("Deleting version '%s' resources", name))
	return k.deleteVersionResources(label, namespace)
}

func (k *ResourceManagerService) DeactivateVersion(name string) error {
	label := strcase.ToKebab(name)
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info(fmt.Sprintf("Deactivating version '%s'", name))
	return k.deactivateEntrypointService(name, namespace, label)
}

func (k *ResourceManagerService) deleteVersionResources(label, namespace string) error {
	gracePeriod := new(int64)
	*gracePeriod = 0

	deletePolicy := metav1.DeletePropagationForeground
	deleteOptions := &metav1.DeleteOptions{
		PropagationPolicy:  &deletePolicy,
		GracePeriodSeconds: gracePeriod,
	}

	listOptions := metav1.ListOptions{
		LabelSelector: fmt.Sprintf("version-name=%s", label),
		Watch:         false,
	}

	// Delete configmaps
	err := k.clientset.CoreV1().ConfigMaps(namespace).DeleteCollection(deleteOptions, listOptions)
	if err != nil {
		return err
	}

	// Delete deployments
	return k.clientset.AppsV1().Deployments(namespace).DeleteCollection(deleteOptions, listOptions)
}

func (k *ResourceManagerService) ActivateVersion(name string) error {
	label := strcase.ToKebab(name)
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info(fmt.Sprintf("Activating version %s", name))
	_, err := k.activateEntrypointService(name, namespace, label)

	return err
}
