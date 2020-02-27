package runtime

import (
	"errors"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"log"

	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/config"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/entity"
)

type Manager struct {
	config    *config.Config
	logger    *simplelogger.SimpleLogger
	clientset *kubernetes.Clientset
	dynClient dynamic.Interface
}

func New(config *config.Config, logger *simplelogger.SimpleLogger, clientset *kubernetes.Clientset, dynClient dynamic.Interface) *Manager {
	return &Manager{
		config,
		logger,
		clientset,
		dynClient,
	}
}

var (
	// ErrCreation error
	ErrCreation = errors.New("error creating a Runtime resource")
	// ErrUnexpected error
	ErrUnexpected = errors.New("unexpected error creating Runtime")
)

// CreateRuntime calls kubernetes to create a new Runtime Object
func (m *Manager) Create(runtimeInput *entity.Runtime) error {
	ns := runtimeInput.Namespace
	_, err := m.createNamespace(ns)
	if err != nil {
		log.Printf("error creating namespace: %v", err)
		return ErrCreation
	}

	// Create RBAC
	err = m.createRBAC(ns)
	if err != nil {
		log.Printf("error creating RBAC: %v", err)
		return ErrCreation
	}

	// Create operator
	err = m.createOperator(ns)
	if err != nil {
		log.Printf("error creating operator: %v", err)
		return ErrCreation
	}

	// Create Runtime
	domain := m.config.BaseDomainName
	err = m.createRuntimeObject(runtimeInput, domain)
	if err != nil {
		log.Printf("error creating runtime object: %v", err)
		return ErrCreation
	}

	log.Printf("all resources created")
	return nil
}
