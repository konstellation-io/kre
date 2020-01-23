package k8s

import (
	"encoding/json"
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

func (k *ResourceManagerService) createVersionFilesConfigmap(namespace string, version *entity.Version) (*apiv1.ConfigMap, error) {
	natsSubject, err := json.Marshal(version.Entrypoint.Config["nats-subjects"])
	if err != nil {
		return nil, err
	}

	return k.clientset.CoreV1().ConfigMaps(namespace).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name: fmt.Sprintf("%s-conf-files", strcase.ToKebab(version.Name)),
			Labels: map[string]string{
				"type":         "version",
				"version-name": strcase.ToKebab(version.Name),
			},
		},
		Data: map[string]string{
			"default.conf": `server {
        listen       80;
        server_name  localhost;

        location / {
            root   /proto;
            autoindex on;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
`,
			"nats_subject.json": string(natsSubject),

			"fluent-bit.conf": `
[SERVICE]
    Flush        1
    Verbose      1

    Daemon       Off
    Log_Level    info

    Plugins_File plugins.conf
    Parsers_File parsers.conf

    HTTP_Server  Off
    HTTP_Listen  0.0.0.0
    HTTP_Port    2020

[INPUT]
    Name        tail
    Tag         mongo_writer
    Buffer_Chunk_Size 1k
    Path        /var/log/app/*.log

[FILTER]
    Name record_modifier
    Match *
    Record version-name ${KRE_VERSION_NAME}
    Record node-name ${KRE_NODE_NAME}
    Record node-id ${KRE_NODE_ID}

[FILTER]
    Name nest
    Match *
    Operation nest
    Wildcard *
    Nest_under doc

[FILTER]
    Name record_modifier
    Match *
    Record coll logs

[FILTER]
    Name  stdout
    Match *

[OUTPUT]
    Name  nats
    Match *
    Host  kre-nats
    Port  4222
`,
		},
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
