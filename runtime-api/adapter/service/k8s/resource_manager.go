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

func (k *ResourceManagerService) CreateNode(version *entity.Version, node *entity.Node) error {
	namespace := k.cfg.Kubernetes.Namespace

	nodeConfig, err := k.createNodeConfigmap(namespace, version, node)
	if err != nil {
		return err
	}

	_, err = k.createNodeDeployment(namespace, version, node, nodeConfig)
	return err
}

func (k *ResourceManagerService) ActivateVersion(name string) error {
	label := fmt.Sprintf("%s-entrypoint", strcase.ToKebab(name))
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info(fmt.Sprintf("Activating version %s", name))
	_, err := k.activateEntrypointService(name, namespace, label)

	return err
}
