package k8s

import (
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (k *ResourceManagerService) createVersionConfigmap(namespace string, version *entity.Version) (*apiv1.ConfigMap, error) {
	name := fmt.Sprintf("%s-global", strcase.ToKebab(version.Name))

	config := make(map[string]string)
	for _, c := range version.Config {
		config[c.Key] = c.Value
	}
	return k.clientset.CoreV1().ConfigMaps(namespace).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
			Labels: map[string]string{
				"type":         "version",
				"version-name": strcase.ToKebab(version.Name),
			},
		},
		Data: config,
	})
}

func (k *ResourceManagerService) updateVersionConfigmap(namespace string, version *entity.Version) (*apiv1.ConfigMap, error) {
	name := fmt.Sprintf("%s-global", strcase.ToKebab(version.Name))

	config := make(map[string]string)
	for _, c := range version.Config {
		config[c.Key] = c.Value
	}

	currentConfig, err := k.clientset.CoreV1().ConfigMaps(namespace).Get(name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	currentConfig.Data = config

	return k.clientset.CoreV1().ConfigMaps(namespace).Update(currentConfig)
}
