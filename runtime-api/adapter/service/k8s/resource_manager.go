package k8s

import (
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
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

func (k *ResourceManagerService) DeployVersion(name string) error {
	label := fmt.Sprintf("%s-entrypoint", name)
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info("Creating configmap")
	_, err := k.createEntrypointConfigmap(namespace)

	k.logger.Info("Creating entrypoint deployment")
	_, err = k.createEntrypointDeployment(name, namespace, label)

	return err
}

func (k *ResourceManagerService) ActivateVersion(name string) error {
	label := fmt.Sprintf("%s-entrypoint", name)
	namespace := k.cfg.Kubernetes.Namespace

	k.logger.Info(fmt.Sprintf("Activating version %s", name))
	_, err := k.activateEntrypointService(name, namespace, label)

	return err
}
