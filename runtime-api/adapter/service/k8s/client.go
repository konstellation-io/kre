package k8s

import (
	"log"

	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
	"k8s.io/client-go/kubernetes"
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
