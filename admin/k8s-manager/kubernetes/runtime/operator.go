package runtime

import (
	"fmt"
	"log"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"github.com/konstellation-io/kre/admin/k8s-manager/entity"
)

func (m *Manager) createRuntimeObject(runtime *entity.Runtime, domain string) error {
	runtimeGVR := schema.GroupVersionResource{
		Group:    "kre.konstellation.io",
		Version:  "v1alpha1",
		Resource: "runtimes",
	}
	client := m.dynClient.Resource(runtimeGVR)

	entrypointURL := fmt.Sprintf("%s.%s", runtime.Namespace, domain)

	log.Printf("Creating Runtime object on '%s' with url: %s", runtime.Namespace, entrypointURL)

	totalMongoReplicas := 3
	if m.config.DevelopmentMode {
		totalMongoReplicas = 1
	}

	definition := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"kind":       "Runtime",
			"apiVersion": runtimeGVR.Group + "/v1alpha1",
			"metadata": map[string]interface{}{
				"name": runtime.Namespace,
			},
			"spec": map[string]interface{}{
				"developmentMode": m.config.DevelopmentMode,
				"entrypoint": map[string]interface{}{
					"host": entrypointURL,
				},
				"sharedStorageClass": m.config.SharedStorageClass,
				"nats_streaming": map[string]interface{}{
					"replicas": 1,
					"storage": map[string]interface{}{
						"className": m.config.NatsStreaming.Storage.ClassName,
						"size":      m.config.NatsStreaming.Storage.Size,
					},
				},
				"mongo": map[string]interface{}{
					"replicas": totalMongoReplicas,
					"persistentVolume": map[string]interface{}{
						"storageClass": m.config.MongoDB.PersistentVolume.StorageClass,
						"size":         m.config.MongoDB.PersistentVolume.Size,
					},
					"auth": map[string]interface{}{
						"key":           runtime.Mongo.SharedKey,
						"adminUser":     runtime.Mongo.Username,
						"adminPassword": runtime.Mongo.Password,
					},
				},
				"minio": map[string]interface{}{
					"credentials": map[string]interface{}{
						"accessKey": runtime.Minio.AccessKey,
						"secretKey": runtime.Minio.SecretKey,
					},
					"storage": map[string]string{
						"size": m.config.SharedStorageSize,
					},
				},
			},
		},
	}

	_, err := client.Namespace(runtime.Namespace).Create(definition, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	log.Print("Runtime Object created")

	return nil
}

func (m *Manager) createK8sRuntimeOperator(runtimeName string) error {
	pullPolicyOption := apiv1.PullAlways
	if m.config.DevelopmentMode {
		pullPolicyOption = apiv1.PullIfNotPresent
	}

	operatorImage := "konstellation/kre-k8s-runtime-operator:" + m.config.Kubernetes.K8sRuntimeOperator.Version

	numReplicas := new(int32)
	*numReplicas = 1

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: "k8s-runtime-operator",
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: numReplicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"name": "k8s-runtime-operator",
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"name": "k8s-runtime-operator",
					},
				},
				Spec: apiv1.PodSpec{
					ServiceAccountName: "k8s-runtime-operator",
					Containers: []apiv1.Container{
						{
							Name:            "k8s-runtime-operator",
							Image:           operatorImage,
							ImagePullPolicy: pullPolicyOption,
							Env: []apiv1.EnvVar{
								{
									Name: "WATCH_NAMESPACE",
									ValueFrom: &apiv1.EnvVarSource{
										FieldRef: &apiv1.ObjectFieldSelector{
											FieldPath: "metadata.namespace",
										},
									},
								},
								{
									Name: "POD_NAME",
									ValueFrom: &apiv1.EnvVarSource{
										FieldRef: &apiv1.ObjectFieldSelector{
											FieldPath: "metadata.name",
										},
									},
								},
								{
									Name:  "OPERATOR_NAME",
									Value: "k8s-runtime-operator",
								},
							},
						},
					},
				},
			},
		},
	}

	log.Printf("Creating KRE Operator deployment %s ...", operatorImage)

	result, err := m.clientset.AppsV1().Deployments(runtimeName).Create(deployment)
	if err != nil {
		return err
	}

	log.Printf("Created deployment %q.", result.GetObjectMeta().GetName())

	return nil
}
