package k8s

import (
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

func (k *ResourceManagerService) CreateRuntimeVersion(id, name string) error {
	// TODO: Call Kubernetes here

	// Create Entrypoint
	k.logger.Info(">>>>>>>>>>>>>>>> CREATING RUNTIME VERSION <<<<<<<<<<<<<<<<<<<<<<")
	err := k.createEntrypoint(id, name)

	// Create all nodes defined on krt.yml

	return err
}

func (k *ResourceManagerService) CheckRuntimeVersionIsCreated(id, name string) error {
	// TODO: Check Kubernetes here

	k.logger.Info(">>>>>>>>>>>>>>>> CHECKING RUNTIME VERSION <<<<<<<<<<<<<<<<<<<<<<")

	return nil
}
