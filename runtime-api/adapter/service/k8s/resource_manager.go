package k8s

import (
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
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

func (k *ResourceManagerService) GetClientset() *kubernetes.Clientset {
	return k.clientset
}

func (k *ResourceManagerService) CreateEntrypoint(version *entity.Version) error {
	name := strcase.ToKebab(version.Name)
	namespace := k.cfg.Kubernetes.Namespace
	entrypoint := &version.Entrypoint

	k.logger.Info("Creating entrypoint configmap")
	_, err := k.createEntrypointConfigmap(name, namespace, entrypoint)

	k.logger.Info("Creating entrypoint deployment")
	_, err = k.createEntrypointDeployment(name, namespace, entrypoint)

	return err
}

func (k *ResourceManagerService) CreateNode(version *entity.Version, node *entity.Node) error {
	namespace := k.cfg.Kubernetes.Namespace

	nodeConfig, err := k.createNodeConfigmap(namespace, version, node)
	if err != nil {
		return err
	}

	_, err = k.createNodeDeployment(namespace, version, node, nodeConfig)
	return err
}

func (k *ResourceManagerService) CreateVersionConfig(version *entity.Version) (string, error) {
	namespace := k.cfg.Kubernetes.Namespace

	versionConfig, err := k.createVersionConfigmap(namespace, version)
	if err != nil {
		return "", err
	}

	_, err = k.createVersionFilesConfigmap(namespace, version)
	if err != nil {
		return "", err
	}

	return versionConfig.Name, nil
}

func (k *ResourceManagerService) StopVersion(name string) error {
	label := strcase.ToKebab(name)
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info(fmt.Sprintf("Deleting version '%s' resources", name))
	return k.deleteVersionResources(label, namespace)
}

func (k *ResourceManagerService) UnpublishVersion(name string) error {
	label := strcase.ToKebab(name)
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info(fmt.Sprintf("Deactivating version '%s'", name))
	return k.deactivateEntrypointService(name, namespace, label)
}

func (k *ResourceManagerService) UpdateVersionConfig(version *entity.Version) error {
	label := strcase.ToKebab(version.Name)
	namespace := k.cfg.Kubernetes.Namespace

	_, err := k.updateVersionConfigmap(namespace, version)
	if err != nil {
		return err
	}

	return k.restartPodsSync(label, namespace)
}

func (k *ResourceManagerService) PublishVersion(name string) error {
	label := strcase.ToKebab(name)
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info(fmt.Sprintf("Activating version %s", name))
	_, err := k.activateEntrypointService(name, namespace, label)

	return err
}
