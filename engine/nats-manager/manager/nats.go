package manager

import (
	"fmt"

	logging "github.com/konstellation-io/kre/engine/nats-manager/logger"
	"github.com/konstellation-io/kre/engine/nats-manager/nats"
	"github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"
)

type Manager interface {
	CreateStreams(runtimeID, versionName string, workflows []*natspb.Workflow) error
	DeleteStreams(runtimeID, versionName string, workflows []string) error
	GetVersionNatsConfig(
		runtimeID,
		versionName string,
		workflows []*natspb.Workflow,
	) (map[string]*natspb.WorkflowNatsConfig, error)
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
) error {
	if len(workflows) <= 0 {
		return fmt.Errorf("no workflows defined")
	}
	for _, workflow := range workflows {
		stream := m.getStreamName(runtimeID, versionName, workflow.Entrypoint)
		subjects := m.getNodesSubjects(stream, workflow.Nodes)
		err := m.client.CreateStream(stream, subjects)
		if err != nil {
			return fmt.Errorf("error creating stream \"%s\": %w", stream, err)
		}
	}
	return nil
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

func (m *NatsManager) GetVersionNatsConfig(
	runtimeID,
	versionName string,
	workflows []*natspb.Workflow,
) (map[string]*natspb.WorkflowNatsConfig, error) {
	workflowsConfig := make(map[string]*natspb.WorkflowNatsConfig, len(workflows))
	for _, workflow := range workflows {
		stream := m.getStreamName(runtimeID, versionName, workflow.Entrypoint)
		nodesConfig := make(map[string]*natspb.NodeNatsConfig, len(workflow.Nodes))
		for _, node := range workflow.Nodes {
			nodesConfig[node.Name] = &natspb.NodeNatsConfig{
				Subject:       m.getSubjectName(stream, node.Name),
				Subscriptions: m.getSubjectsToSubscribe(stream, node.Subscriptions),
			}
		}
		workflowsConfig[workflow.Name] = &natspb.WorkflowNatsConfig{
			Stream: stream,
			Nodes:  nodesConfig,
		}
	}

	return workflowsConfig, nil
}

func (m *NatsManager) getStreamName(runtimeID, versionName, workflowEntrypoint string) string {
	return fmt.Sprintf("%s-%s-%s", runtimeID, versionName, workflowEntrypoint)
}

func (m *NatsManager) getNodesSubjects(stream string, nodes []*natspb.Node) []string {
	subjects := make([]string, 0, len(nodes))
	for _, node := range nodes {
		nodeSubject := m.getSubjectName(stream, node.Name)
		nodeSubsubject := nodeSubject + ".*"
		subjects = append(subjects, nodeSubject, nodeSubsubject)
	}
	return subjects
}

func (m *NatsManager) getSubjects(nodesSubjects map[string][]string) []string {
	subjects := make([]string, 0, len(nodesSubjects))
	for _, nodeSubjects := range nodesSubjects {
		for _, nodeSubject := range nodeSubjects {
			subjects = append(subjects, nodeSubject)
		}
	}
	return subjects
}

func (m *NatsManager) getSubjectName(stream, node string) string {
	return fmt.Sprintf("%s.%s", stream, node)
}

func (m *NatsManager) getSubjectsToSubscribe(stream string, subscriptions []string) []string {
	subjectsToSubscribe := make([]string, 0, len(subscriptions))
	for _, nodeToSubscribe := range subscriptions {
		subjectsToSubscribe = append(subjectsToSubscribe, m.getSubjectName(stream, nodeToSubscribe))
	}
	return subjectsToSubscribe
}
