package kubernetes

import (
	"errors"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/input"
	"log"

	"k8s.io/client-go/dynamic"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/config"
	"k8s.io/client-go/kubernetes"
)

// ResourceManager interacts with K8s
type ResourceManager struct {
	config    *config.Config
	clientset *kubernetes.Clientset
	dynClient dynamic.Interface
}

// NewKubernetesResourceManager instantiate the KubernetesResourceManager
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
	// ErrRuntimeResourceCreation error
	ErrRuntimeResourceCreation = errors.New("error creating a Runtime resource")
	// ErrUnexpected error
	ErrUnexpected = errors.New("unexpected error creating Runtime")
)

// CreateRuntime calls kubernetes to create a new Runtime Object
func (k *ResourceManager) CreateRuntime(runtimeInput *input.CreateRuntimeInput) error {
	// Create namespace
	name := runtimeInput.Name
	res, err := k.createNamespace(name)
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
	err = k.createKreOperator(name)
	if err != nil {
		log.Printf("error creating operator: %v", err)
		return ErrRuntimeResourceCreation
	}

	// Create Runtime
	domain := k.config.BaseDomainName
	err = k.createRuntimeObject(runtimeInput, domain)
	if err != nil {
		log.Printf("error creating runtime object: %v", err)
		return ErrRuntimeResourceCreation
	}

	log.Printf("all resources created")
	return nil
}
