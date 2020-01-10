package kubernetes

import (
	"fmt"
	"log"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/input"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

var (
	runtimeGVR = schema.GroupVersionResource{
		Group:    "kre.konstellation.io",
		Version:  "v1alpha1",
		Resource: "runtimes",
	}
)

func (k *ResourceManager) createRuntimeObject(runtime *input.CreateRuntimeInput, domain string) error {
	runtimeClient := k.dynClient.Resource(runtimeGVR)

	entrypointURL := fmt.Sprintf("%s.%s", runtime.Name, domain)

	runtimeDefinition := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"kind":       "Runtime",
			"apiVersion": runtimeGVR.Group + "/v1alpha1",
			"metadata": map[string]interface{}{
				"name": runtime.Name,
			},
			"spec": map[string]interface{}{
				"entrypoint": map[string]interface{}{
					"host": entrypointURL,
				},
				"sharedStorageClass": k.config.SharedStorageClass,
				"minio": map[string]interface{}{
					"credentials": map[string]interface{}{
						"accessKey": runtime.Minio.AccessKey,
						"secretKey": runtime.Minio.SecretKey,
					},
					"storage": map[string]string{
						"size": k.config.SharedStorageSize,
					},
				},
			},
		},
	}

	log.Print("Creating Runtime object")
	_, err := runtimeClient.Namespace(runtime.Name).Create(runtimeDefinition, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	log.Print("Runtime Object created")
	return nil
}
