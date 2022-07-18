package nats

import (
	"fmt"

	"github.com/konstellation-io/kre/engine/k8s-manager/config"
	"github.com/konstellation-io/kre/engine/k8s-manager/proto/versionpb"
	"github.com/konstellation-io/kre/libs/simplelogger"
	"github.com/nats-io/nats.go"
)

type Manager interface {
	GetStreamName(runtimeID, versionName, workflowEntrypoint string) string
	GetStreamSubjectName(runtimeID, versionName, workflowEntrypoint, nodeName string) string
	CreateNatsStream(runtimeID, versionName, ns string, workflow *versionpb.Workflow) error
	DeleteNatsStream(runtimeID, versionName, workflowEntrypoint string) error
}

type NatsManager struct {
	config *config.Config
	logger *simplelogger.SimpleLogger
}

func NewNatsManager(config *config.Config, logger *simplelogger.SimpleLogger) *NatsManager {
	return &NatsManager{
		config: config,
		logger: logger,
	}
}

func (nm *NatsManager) GetStreamName(runtimeID, versionName, workflowEntrypoint string) string {
	return fmt.Sprintf("%s-%s-%s", runtimeID, versionName, workflowEntrypoint)
}

func (nm *NatsManager) GetStreamSubjectName(runtimeID, versionName, workflowEntrypoint, nodeName string) string {
	return fmt.Sprintf("%s-%s-%s.%s", runtimeID, versionName, workflowEntrypoint, nodeName)
}

func (nm *NatsManager) CreateNatsStream(runtimeID, versionName, ns string, workflow *versionpb.Workflow) error {
	// TODO
	// Currently the endpoint is the responsible of the creation of the streams and their wildcard subjects
	return nil
}

func (nm *NatsManager) DeleteNatsStream(runtimeID, versionName, workflowEntrypoint string) error {
	conn, err := nats.Connect(nm.config.NatsStreaming.URL)
	if err != nil {
		return err
	}
	defer conn.Close()

	js, err := conn.JetStream()
	if err != nil {
		return err
	}

	err = js.DeleteStream(nm.GetStreamName(runtimeID, versionName, workflowEntrypoint))
	if err != nil {
		return err
	}

	return nil
}
