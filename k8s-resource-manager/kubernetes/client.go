package kubernetes

import (
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-resource-manager/config"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"log"
)

func newClientset(
	cfg *config.Config,
) *kubernetes.Clientset {

	// creates kubeConfig
	kubeConfig := newKubernetesConfig(cfg)

	// create the clientset
	clientset, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		log.Fatalf("Fatal error kubernetes config: %s", err)
	}

	return clientset
}

func newDynamicClient(
	cfg *config.Config,
) dynamic.Interface {

	// creates kubeConfig
	kubeConfig := newKubernetesConfig(cfg)

	dynClient, err := dynamic.NewForConfig(kubeConfig)
	if err != nil {
		log.Fatalf("Fatal error kubernetes config: %s", err)
	}

	return dynClient
}
