package kubernetes

import (
	"log"
	"os"
	"path/filepath"

	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"

	"github.com/konstellation-io/kre/runtime/k8s-manager/config"
)

func NewClientset(cfg *config.Config) *kubernetes.Clientset {
	kubeConfig := newKubernetesConfig(cfg)

	// create the clientset
	clientset, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		log.Fatalf("Fatal error kubernetes config: %s", err)
	}

	return clientset
}

func NewDynamicClient(cfg *config.Config) dynamic.Interface {
	kubeConfig := newKubernetesConfig(cfg)

	dynClient, err := dynamic.NewForConfig(kubeConfig)
	if err != nil {
		log.Fatalf("Fatal error kubernetes config: %s", err)
	}

	return dynClient
}

func newKubernetesConfig(config *config.Config) *rest.Config {
	if config.Kubernetes.IsInsideCluster {
		log.Printf("Creating K8s config in-cluster")

		kubeConfig, err := rest.InClusterConfig()
		if err != nil {
			log.Fatalf("fatal error kubernetes config: %s", err)
		}

		return kubeConfig
	}

	log.Printf("Creating K8s config from local .kube/config")

	// NOTE: It works only with the default user's config, not even the exported KUBECONFIG value
	kubeConfigPath := filepath.Join(os.Getenv("HOME"), ".kube", "config")

	// use the current context in kubeConfigPath
	kubeConfig, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
	if err != nil {
		log.Fatalf("fatal error kubernetes config: %s", err)
	}

	return kubeConfig
}
