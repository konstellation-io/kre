package manager

import (
	"fmt"

	logging "github.com/konstellation-io/kre/engine/nats-manager/logger"
	"github.com/konstellation-io/kre/engine/nats-manager/nats"
	"github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"
)

type Manager interface {
	CreateStreams(runtimeID, versionName string, workflows []*natspb.Workflow) (map[string]*natspb.StreamInfo, error)
	DeleteStreams(runtimeID, versionName string, workflows []string) error
}

type NatsManager struct {
	logger logging.Logger
	client nats.Client
}

func NewNatsManager(logger logging.Logger, client nats.Client) *NatsManager {
	return &NatsManager{
		logger: logger,
		client: client,
	}
}

func (m *NatsManager) CreateStreams(
	runtimeID,
	versionName string,
	workflows []*natspb.Workflow,
) (map[string]*natspb.StreamInfo, error) {
	if len(workflows) <= 0 {
		return nil, fmt.Errorf("no workflows defined")
	}
	workflowToStream := make(map[string]*natspb.StreamInfo, len(workflows))
	for _, workflow := range workflows {
		stream := m.getStreamName(runtimeID, versionName, workflow.Entrypoint)
		nodesSubjects := m.getNodesSubjects(stream, workflow.Nodes)
		subjects := []string{stream + ".*", stream + ".*" + ".*"}
		err := m.client.CreateStream(stream, subjects)
		if err != nil {
			return nil, fmt.Errorf("error creating stream \"%s\": %w", stream, err)
		}
		workflowToStream[workflow.Name] = &natspb.StreamInfo{
			Stream:        stream,
			NodesSubjects: nodesSubjects,
		}
	}
	return workflowToStream, nil
}
func (m *NatsManager) getStreamName(runtimeID, versionName, workflowEntrypoint string) string {
	return fmt.Sprintf("%s-%s-%s", runtimeID, versionName, workflowEntrypoint)
}

func (m *NatsManager) getNodesSubjects(stream string, nodes []string) map[string]string {
	const entrypointNodeName = "entrypoint"
	nodesSubjects := map[string]string{entrypointNodeName: m.getSubjectName(stream, entrypointNodeName)}
	for _, node := range nodes {
		nodesSubjects[node] = m.getSubjectName(stream, node)
	}
	return nodesSubjects
}

func (m *NatsManager) getSubjects(nodesSubjects map[string]string) []string {
	subjects := make([]string, 0, len(nodesSubjects))
	for _, subject := range nodesSubjects {
		subjects = append(subjects, subject+".*")
	}
	return subjects
}

func (m *NatsManager) getSubjectName(stream, node string) string {
	return fmt.Sprintf("%s.%s", stream, node)
}

func (m *NatsManager) DeleteStreams(runtimeID, versionName string, workflows []string) error {
	for _, workflow := range workflows {
		stream := m.getStreamName(runtimeID, versionName, workflow)
		err := m.client.DeleteStream(stream)
		if err != nil {
			return fmt.Errorf("error deleting stream \"%s\": %w", stream, err)
		}
	}
	return nil
}
