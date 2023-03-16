package manager

import (
	"fmt"
	"regexp"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/entity"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/errors"
	logging "github.com/konstellation-io/kre/engine/nats-manager/internal/logger"
)

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/${GOFILE} -package=mocks

type Client interface {
	//Connect(url string) error
	CreateStream(streamConfig *entity.StreamConfig) error
	CreateObjectStore(objectStore string) error
	GetObjectStoresNames() []string
	DeleteStream(stream string) error
	DeleteObjectStore(stream string) error
}

type NatsManager struct {
	logger logging.Logger
	client Client
}

const entrypointNodeName = "entrypoint"

func NewNatsManager(logger logging.Logger, client Client) *NatsManager {
	return &NatsManager{
		logger: logger,
		client: client,
	}
}

func (m *NatsManager) CreateStreams(
	runtimeID,
	versionName string,
	workflows []*entity.Workflow,
) (entity.WorkflowsStreamsConfig, error) {
	if len(workflows) <= 0 {
		return nil, fmt.Errorf("no workflows defined")
	}

	workflowsStreamsConfig := entity.WorkflowsStreamsConfig{}

	for _, workflow := range workflows {
		stream := m.getStreamName(runtimeID, versionName, workflow.Entrypoint)
		nodesStreamConfig := m.getNodesStreamConfig(stream, workflow.Nodes)

		streamConfig := &entity.StreamConfig{
			Stream:            stream,
			Nodes:             nodesStreamConfig,
			EntrypointSubject: m.getSubjectName(stream, entrypointNodeName),
		}

		err := m.client.CreateStream(streamConfig)
		if err != nil {
			return nil, fmt.Errorf("error creating stream \"%s\": %w", stream, err)
		}

		workflowsStreamsConfig[workflow.Name] = streamConfig
	}

	return workflowsStreamsConfig, nil
}

func (m *NatsManager) CreateObjectStores(
	runtimeID,
	versionName string,
	workflows []*entity.Workflow,
) (entity.WorkflowsObjectStoresConfig, error) {
	if len(workflows) <= 0 {
		return nil, fmt.Errorf("no workflows defined")
	}

	if err := m.validateWorkflows(workflows); err != nil {
		return nil, fmt.Errorf("error validating worklfows: %w", err)
	}

	workflowsObjectStoresConfig := entity.WorkflowsObjectStoresConfig{}

	for _, workflow := range workflows {
		nodesObjectStoresConfig := entity.NodesObjectStoresConfig{}

		for _, node := range workflow.Nodes {
			if node.ObjectStore != nil {
				if node.ObjectStore.Name == "" {
					return nil, errors.ErrInvalidObjectStoreName
				}

				objectStore, err := m.getObjectStoreName(runtimeID, versionName, workflow.Name, node.ObjectStore)
				if err != nil {
					return nil, err
				}

				err = m.client.CreateObjectStore(objectStore)
				if err != nil {
					return nil, fmt.Errorf("error creating object store %q: %w", objectStore, err)
				}

				nodesObjectStoresConfig[node.Name] = objectStore
			}
		}
		workflowsObjectStoresConfig[workflow.Name] = &entity.WorkflowObjectStoresConfig{
			Nodes: nodesObjectStoresConfig,
		}
	}

	return workflowsObjectStoresConfig, nil
}

func (m *NatsManager) getObjectStoreName(runtimeID, versionName, workflowName string, objectStore *entity.ObjectStore) (string, error) {
	switch objectStore.Scope {
	case entity.ScopeProject:
		return fmt.Sprintf("object-store_%s_%s_%s", runtimeID, versionName, objectStore.Name), nil
	case entity.ScopeWorkflow:
		return fmt.Sprintf("object-store_%s_%s_%s_%s", runtimeID, versionName, workflowName, objectStore.Name), nil
	default:
		return "", errors.ErrInvalidObjectStoreScope
	}
}

func (m *NatsManager) DeleteStreams(runtimeID, versionName string, workflows []string) error {
	for _, workflow := range workflows {
		stream := m.getStreamName(runtimeID, versionName, workflow)
		err := m.client.DeleteStream(stream)
		if err != nil {
			return fmt.Errorf("error deleting stream %q: %w", stream, err)
		}
	}
	return nil
}

func (m *NatsManager) DeleteObjectStores(runtimeID, versionName string) error {
	allObjectStores := m.client.GetObjectStoresNames()

	regex, err := regexp.Compile(fmt.Sprintf("object-store_%s_%s_.*", runtimeID, versionName))
	if err != nil {
		return fmt.Errorf("error compiling regex: %w", err)
	}

	for _, objectStore := range allObjectStores {
		if regex.MatchString(objectStore) {
			m.logger.Debugf("Obtained OBS name: %s", objectStore)
			err := m.client.DeleteObjectStore(objectStore)
			if err != nil {
				return fmt.Errorf("error deleting object store %q: %w", objectStore, err)
			}
		}
	}

	return nil
}

//
//func (m *NatsManager) GetVersionNatsConfig(
//	runtimeID,
//	versionName string,
//	workflows []*natspb.Workflow,
//) (map[string]*natspb.WorkflowNatsConfig, error) {
//	workflowsConfig := make(map[string]*natspb.WorkflowNatsConfig, len(workflows))
//	for _, workflow := range workflows {
//		stream := m.getStreamName(runtimeID, versionName, workflow.Entrypoint)
//		nodesConfig := make(map[string]*natspb.NodeNatsConfig, len(workflow.Nodes))
//		for _, node := range workflow.Nodes {
//			nodesConfig[node.Name] = &natspb.NodeNatsConfig{
//				Subject:       m.getSubjectName(stream, node.Name),
//				Subscriptions: m.getSubjectsToSubscribe(stream, node.Subscriptions),
//			}
//
//			if node.ObjectStore != nil {
//				objStoreName, err := m.getObjectStoreName(runtimeID, versionName, workflow.Name, node.ObjectStore)
//				if err != nil {
//					return nil, err
//				}
//				nodesConfig[node.Name].ObjectStore = &objStoreName
//			}
//		}
//		workflowsConfig[workflow.Name] = &natspb.WorkflowNatsConfig{
//			Stream: stream,
//			Nodes:  nodesConfig,
//		}
//	}
//
//	return workflowsConfig, nil
//}

func (m *NatsManager) getStreamName(runtimeID, versionName, workflowEntrypoint string) string {
	return fmt.Sprintf("%s-%s-%s", runtimeID, versionName, workflowEntrypoint)
}

func (m *NatsManager) getNodesStreamConfig(stream string, nodes []*entity.Node) entity.NodesStreamConfig {
	nodesConfig := entity.NodesStreamConfig{}
	for _, node := range nodes {
		nodesConfig[node.Name] = entity.NodeStreamConfig{
			Subject:       m.getSubjectName(stream, node.Name),
			Subscriptions: m.getSubjectsToSubscribe(stream, node.Subscriptions),
		}
	}
	return nodesConfig
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

func (m *NatsManager) validateWorkflows(workflows []*entity.Workflow) error {
	for _, workflow := range workflows {
		if err := workflow.Validate(); err != nil {
			return err
		}
	}
	return nil
}
