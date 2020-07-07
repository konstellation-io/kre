package runtime

import (
	"log"

	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (m *Manager) createNamespace(ns string) (*apiv1.Namespace, error) {
	log.Printf("Creating namespace: %v", ns)

	return m.clientset.CoreV1().Namespaces().Create(&apiv1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: ns,
		},
	})
}
