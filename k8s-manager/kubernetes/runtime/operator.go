package runtime

import (
	"fmt"
	"log"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/entity"
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
	_, err := client.Namespace(runtime.Namespace).Create(&unstructured.Unstructured{
		Object: map[string]interface{}{
			"kind":       "Runtime",
			"apiVersion": runtimeGVR.Group + "/v1alpha1",
			"metadata": map[string]interface{}{
				"name": runtime.Namespace,
			},
			"spec": map[string]interface{}{
				"entrypoint": map[string]interface{}{
					"host": entrypointURL,
				},
				"sharedStorageClass": m.config.SharedStorageClass,
				"nats_streaming": map[string]interface{}{
					"replicas": 1,
				},
				"mongo": map[string]interface{}{
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
	}, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	log.Print("Runtime Object created")
	return nil
}

func (m *Manager) createOperator(runtimeName string) error {
	operatorImage := "konstellation/kre-operator:" + m.config.Kubernetes.Operator.Version

	numReplicas := new(int32)
	*numReplicas = 1

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: "kre-operator",
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: numReplicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"name": "kre-operator",
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"name": "kre-operator",
					},
				},
				Spec: apiv1.PodSpec{
					ServiceAccountName: "kre-operator",
					Containers: []apiv1.Container{
						{
							Name:            "kre-operator",
							Image:           operatorImage,
							ImagePullPolicy: apiv1.PullIfNotPresent,
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
									Value: "kre-operator",
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
