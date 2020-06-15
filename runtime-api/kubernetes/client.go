package kubernetes

import (
	"os"
	"path/filepath"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"github.com/konstellation-io/kre/runtime-api/config"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type K8sManager struct {
	cfg    *config.Config
	logger *simplelogger.SimpleLogger
}

func NewK8sManager(cfg *config.Config, logger *simplelogger.SimpleLogger) *K8sManager {
	return &K8sManager{
		cfg,
		logger,
	}
}

func (k *K8sManager) NewClientset() *kubernetes.Clientset {
	kubeConfig := k.newKubernetesConfig()

	// create the clientset
	clientset, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		k.logger.Errorf("Fatal error kubernetes config: %s", err)
		os.Exit(1)
	}

	return clientset
}

func (k *K8sManager) newKubernetesConfig() *rest.Config {
	if k.cfg.Kubernetes.IsInsideCluster == true {
		k.logger.Info("Creating K8s config in-cluster")

		kubeConfig, err := rest.InClusterConfig()
		if err != nil {
			k.logger.Errorf("fatal error kubernetes config: %s", err)
			os.Exit(1)
		}

		return kubeConfig
	}

	k.logger.Info("Creating K8s config from local .kube/config")

	// NOTE: It works only with the default user's config, not even the exported KUBECONFIG value
	kubeConfigPath := filepath.Join(os.Getenv("HOME"), ".kube", "config")

	// use the current context in kubeConfigPath
	kubeConfig, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
	if err != nil {
		k.logger.Errorf("fatal error kubernetes config: %s", err)
		os.Exit(1)
	}

	return kubeConfig
}
