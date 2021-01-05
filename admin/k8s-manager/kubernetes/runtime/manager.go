package runtime

import (
	"errors"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"

	"github.com/konstellation-io/kre/admin/k8s-manager/config"
	"github.com/konstellation-io/kre/admin/k8s-manager/entity"
)

// Manager expose methods to handle Runtime Objects.
type Manager struct {
	config    *config.Config
	logger    *simplelogger.SimpleLogger
	clientset *kubernetes.Clientset
	dynClient dynamic.Interface
}

// New creates a new Runtime Manager.
func New(
	cfg *config.Config,
	logger *simplelogger.SimpleLogger,
	clientset *kubernetes.Clientset,
	dynClient dynamic.Interface,
) *Manager {
	return &Manager{
		cfg,
		logger,
		clientset,
		dynClient,
	}
}

var (
	// ErrCreation when Runtime Object can't be created.
	ErrCreation = errors.New("error creating a Runtime resource")
	// ErrUnexpected for any unknown error related to Runtime creation.
	ErrUnexpected = errors.New("unexpected error creating Runtime")
)

// Create calls kubernetes to create a new Runtime Object.
func (m *Manager) Create(runtimeInput *entity.Runtime) error {
	ns := runtimeInput.Namespace

	_, err := m.createNamespace(ns)
	if err != nil {
		m.logger.Errorf("error creating namespace: %v", err)
		return ErrCreation
	}

	// Create RBAC
	err = m.createRBAC(ns)
	if err != nil {
		m.logger.Errorf("error creating RBAC: %v", err)
		return ErrCreation
	}

	// Create K8s Runtime Operator
	err = m.createK8sRuntimeOperator(ns)
	if err != nil {
		m.logger.Errorf("error creating k8s runtime operator: %v", err)
		return ErrCreation
	}

	// Create Runtime
	domain := m.config.BaseDomainName

	err = m.createRuntimeObject(runtimeInput, domain)
	if err != nil {
		m.logger.Errorf("error creating runtime object: %v", err)
		return ErrCreation
	}

	m.logger.Infof("all resources created")

	return nil
}
