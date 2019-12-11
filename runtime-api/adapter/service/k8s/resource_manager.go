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

func (k *ResourceManagerService) CreateRuntimeVersion(name string) (string, error) {
	// TODO: Call Kubernetes here

	err := k.createEntrypoint(name)

	fmt.Print(err)

	return "", nil
}
