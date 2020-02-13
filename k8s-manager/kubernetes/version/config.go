package version

import (
	"encoding/json"
	"fmt"

	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/entity"
)

func (m *Manager) createConfig(version *entity.Version, econf EntrypointConfig) (string, error) {
	versionConfig, err := m.createConfigMap(version)
	if err != nil {
		return "", err
	}

	_, err = m.createFilesConfigMap(version, econf)
	if err != nil {
		return "", err
	}

	return versionConfig.Name, nil
}

func (m *Manager) createConfigMap(version *entity.Version) (*apiv1.ConfigMap, error) {
	ns := version.Namespace
	config := make(map[string]string)
	for _, c := range version.Config {
		config[c.Key] = c.Value
	}

	return m.clientset.CoreV1().ConfigMaps(ns).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      fmt.Sprintf("%s-global", version.Name),
			Namespace: ns,
			Labels: map[string]string{
				"type":         "version",
				"version-name": version.Name,
			},
		},
		Data: config,
	})
}

func (m *Manager) createFilesConfigMap(version *entity.Version, econf EntrypointConfig) (*apiv1.ConfigMap, error) {
	ns := version.Namespace
	natsSubject, err := json.Marshal(econf["nats-subjects"])
	if err != nil {
		return nil, err
	}

	return m.clientset.CoreV1().ConfigMaps(ns).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name: fmt.Sprintf("%s-conf-files", version.Name),
			Labels: map[string]string{
				"type":         "version",
				"version-name": version.Name,
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

func (m *Manager) updateConfigMap(version *entity.Version) (*apiv1.ConfigMap, error) {
	name := fmt.Sprintf("%s-global", version.Name)
	ns := version.Namespace

	config := make(map[string]string)
	for _, c := range version.Config {
		config[c.Key] = c.Value
	}

	m.logger.Infof("Creating version '%s' on ns: '%s'", name, ns)
	currentConfig, err := m.clientset.CoreV1().ConfigMaps(ns).Get(name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	currentConfig.Data = config

	return m.clientset.CoreV1().ConfigMaps(ns).Update(currentConfig)
}
