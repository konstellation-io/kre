package kubernetes

import (
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"log"
)

func (k *ResourceManager) createKreOperator(runtimeName string) error {
	operatorImage := "konstellation/kre-operator:" + k.config.Kubernetes.Operator.Version

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
							ImagePullPolicy: apiv1.PullAlways,
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
	result, err := k.clientset.AppsV1().Deployments(runtimeName).Create(deployment)
	if err != nil {
		return err
	}

	log.Printf("Created deployment %q.", result.GetObjectMeta().GetName())

	return nil
}
