package kubernetes

import (
	"fmt"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"log"
)

var (
	runtimeGVR = schema.GroupVersionResource{
		Group:    "kre.konstellation.io",
		Version:  "v1alpha1",
		Resource: "runtimes",
	}
)

func (k *ResourceManager) createRuntimeObject(runtimeName, domain string) error {
	runtimeClient := k.dynClient.Resource(runtimeGVR)

	entrypointURL := fmt.Sprintf("entrypoint.%s.%s", runtimeName, domain)

	runtimeDefinition := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"kind":       "Runtime",
			"apiVersion": runtimeGVR.Group + "/v1alpha1",
			"metadata": map[string]interface{}{
				"name": runtimeName,
			},
			"spec": map[string]interface{}{
				"entrypoint": map[string]interface{}{
					"host": entrypointURL,
				},
			},
		},
	}

	log.Print("Creating Runtime object")
	_, err := runtimeClient.Namespace(runtimeName).Create(runtimeDefinition, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	log.Print("Runtime Object created")
	return nil
}
