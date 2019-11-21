package kubernetes

import (
	"log"
	"os"
	"path/filepath"

	"k8s.io/client-go/rest"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/config"
	"k8s.io/client-go/tools/clientcmd"
)

func newKubernetesConfig(
	config *config.Config,
) *rest.Config {
	if config.Kubernetes.IsInsideCluster == true {
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
