package version

import (
	"fmt"

	"github.com/konstellation-io/kre/admin/k8s-manager/proto/versionpb"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (m *Manager) getCommonEnvVars(req *versionpb.StartRequest) []apiv1.EnvVar {
	return []apiv1.EnvVar{
		{Name: "KRT_INFLUX_URI", Value: req.GetInfluxUri()},
		{Name: "KRT_VERSION_ID", Value: req.GetVersionId()},
		{Name: "KRT_VERSION", Value: req.GetVersionName()},
		{Name: "KRT_MONGO_URI", Value: req.GetMongoUri()},
		{Name: "KRT_MONGO_DB_NAME", Value: req.GetMongoDbName()},
		{Name: "KRT_MONGO_BUCKET", Value: req.GetMongoKrtBucket()},
		{Name: "KRT_BASE_PATH", Value: basePathKRT},
		{Name: "KRT_NATS_SERVER", Value: natsURL},
	}
}

func (m *Manager) createVersionConfFiles(versionName, ns string, workflows []*versionpb.Workflow) error {
	m.logger.Info("Creating version config files...")

	natsSubjectJSON, err := m.generateNATSSubjects(versionName, workflows)
	if err != nil {
		return err
	}

	_, err = m.clientset.CoreV1().ConfigMaps(ns).Create(&apiv1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name: fmt.Sprintf("%s-conf-files", versionName),
			Labels: map[string]string{
				"type":         "version",
				"version-name": versionName,
			},
		},
		Data: map[string]string{
			"default.conf": `server {
        listen       8080;
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
			"nats_subject.json": natsSubjectJSON,

			"parsers.conf": `
[PARSER]
    Name multiline_pattern
    Format regex
    Regex ^(?<logtime>\d{4}\-\d{2}\-\d{2}T\d{1,2}\:\d{1,2}\:\d{1,2}(\.\d+Z|\+0000)) (?<level>(ERROR|WARN|INFO|DEBUG)) (?<capture>.*)
`,

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
    Tag         mongo_writer_logs
    Buffer_Chunk_Size 1k
    Path        /var/log/app/*.log
    Multiline On
    Parser_Firstline multiline_pattern

[FILTER]
    Name record_modifier
    Match *
    Record versionId ${KRT_VERSION_ID}
    Record versionName ${KRT_VERSION}
    Record nodeName ${KRT_NODE_NAME}
    Record nodeId ${KRT_NODE_ID}
    Record workflowName ${KRT_WORKFLOW_NAME}
    Record workflowId ${KRT_WORKFLOW_ID}

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

	return err
}
