package kubernetes

import (
	"errors"
	"log"

	"k8s.io/client-go/dynamic"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/config"
	"k8s.io/client-go/kubernetes"
)

// ResourceManager interacts with
type ResourceManager struct {
	config    *config.Config
	clientset *kubernetes.Clientset
	dynClient dynamic.Interface
}

func NewKubernetesResourceManager(
	config *config.Config,
) *ResourceManager {
	clientset := newClientset(config)
	dynClient := newDynamicClient(config)

	return &ResourceManager{
		config,
		clientset,
		dynClient,
	}
}

var (
	ErrRuntimeResourceCreation = errors.New("error creating a Runtime resource")
	ErrUnexpected              = errors.New("unexpected error creating Runtime")
)

func (k *ResourceManager) CreateRuntime(runtimeName string) error {

	// Create namespace
	res, err := k.createNamespace(runtimeName)
	if err != nil {
		log.Printf("error creating namespace: %v", err)
		return ErrRuntimeResourceCreation
	}

	ns := res.Name

	// Create RBAC
	err = k.createRBAC(ns)
	if err != nil {
		log.Printf("error creating RBAC: %v", err)
		return ErrRuntimeResourceCreation
	}

	// Create operator
	err = k.createKreOpeartor(runtimeName)
	if err != nil {
		log.Printf("error creating operator: %v", err)
		return ErrRuntimeResourceCreation
	}

	// Create Runtime
	domain := k.config.BaseDomainName
	err = k.createRuntimeObject(runtimeName, domain)
	if err != nil {
		log.Printf("error creating runtime object: %v", err)
		return ErrRuntimeResourceCreation
	}

	log.Printf("all resources created")
	return nil
}
