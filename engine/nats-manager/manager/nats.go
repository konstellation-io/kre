package manager

import (
	"errors"
	"fmt"
	logging "github.com/konstellation-io/kre/engine/nats-manager/logger"
	"regexp"
)

//go:generate mockgen -source=${GOFILE} -destination=../mocks/${GOFILE} -package=mocks

type Client interface {
	//Connect(url string) error
	CreateStream(streamConfig *StreamConfig) error
	CreateObjectStore(objectStore string) error
	DeleteStream(stream string) error
}

type Node struct {
	Name          string
	Subscriptions []string
	ObjectStore   *ObjectStore
}

func (n Node) Validate() error {
	if n.Name == "" {
		return errors.New("node name cannot be empty")
	}

	if n.ObjectStore == nil {
		return nil
	}

	if err := n.ObjectStore.Validate(); err != nil {
		return fmt.Errorf("invalid node object store: %w", err)
	}

	return nil
}

type ObjectStoreScope int

const entrypointNodeName = "entrypoint"

const (
	ScopeWorkflow = iota
	ScopeProject
)

type ObjectStore struct {
	Name  string
	Scope ObjectStoreScope
}

func (o ObjectStore) Validate() error {
	isValidName, _ := regexp.MatchString("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$", o.Name)

	if !isValidName {
		return ErrInvalidObjectStoreName
	}

	switch o.Scope {
	case ScopeProject, ScopeWorkflow:
		return nil
	default:
		return ErrInvalidObjectStoreScope
	}
}

type Workflow struct {
	Name       string
	Entrypoint string
	Nodes      []*Node
}

func (w *Workflow) Validate() error {
	if w.Name == "" {
		return errors.New("workflow name cannot be empty")
	}

	if w.Entrypoint == "" {
		return errors.New("workflow entrypoint service cannot be empty")
	}

	for _, node := range w.Nodes {
		if err := node.Validate(); err != nil {
			return fmt.Errorf("invalid node: %w", err)
		}
	}

	return nil
}

type NodeStreamConfig struct {
	Subject       string
	Subscriptions []string
}

type NodesStreamConfig map[string]NodeStreamConfig

type StreamConfig struct {
	Stream            string
	Nodes             NodesStreamConfig
	EntrypointSubject string
}

type WorkflowsStreamsConfig map[string]*StreamConfig

type NodesObjectStoresConfig map[string]string

type WorkflowObjectStoresConfig struct {
	Nodes NodesObjectStoresConfig
}

type WorkflowsObjectStoresConfig map[string]*WorkflowObjectStoresConfig

type Manager interface {
	CreateStreams(runtimeID, versionName string, workflows []*Workflow) (WorkflowsStreamsConfig, error)
	CreateObjectStore(runtimeID, versionName string, workflows []*Workflow) error
	DeleteStreams(runtimeID, versionName string, workflows []string) error
}

type NatsManager struct {
	logger logging.Logger
	client Client
}

func NewNatsManager(logger logging.Logger, client Client) *NatsManager {
	return &NatsManager{
		logger: logger,
		client: client,
	}
}

func (m *NatsManager) CreateStreams(
	runtimeID,
	versionName string,
	workflows []*Workflow,
) (WorkflowsStreamsConfig, error) {
	if len(workflows) <= 0 {
		return nil, fmt.Errorf("no workflows defined")
	}

	workflowsStreamsConfig := WorkflowsStreamsConfig{}

	for _, workflow := range workflows {
		stream := m.getStreamName(runtimeID, versionName, workflow.Entrypoint)
		nodesStreamConfig := m.getNodesStreamConfig(stream, workflow.Nodes)

		streamConfig := &StreamConfig{
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
	workflows []*Workflow,
) (WorkflowsObjectStoresConfig, error) {
	if len(workflows) <= 0 {
		return nil, fmt.Errorf("no workflows defined")
	}

	if err := m.validateWorkflows(workflows); err != nil {
		return nil, fmt.Errorf("error validating worklfows: %w", err)
	}

	workflowsObjectStoresConfig := WorkflowsObjectStoresConfig{}

	for _, workflow := range workflows {
		nodesObjectStoresConfig := NodesObjectStoresConfig{}

		for _, node := range workflow.Nodes {
			if node.ObjectStore != nil {
				if node.ObjectStore.Name == "" {
					return nil, ErrInvalidObjectStoreName
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
		workflowsObjectStoresConfig[workflow.Name] = &WorkflowObjectStoresConfig{
			Nodes: nodesObjectStoresConfig,
		}
	}

	return workflowsObjectStoresConfig, nil
}

func (m *NatsManager) getObjectStoreName(runtimeID, versionName, workflowName string, objectStore *ObjectStore) (string, error) {
	switch objectStore.Scope {
	case ScopeProject:
		return fmt.Sprintf("object-store_%s_%s_%s", runtimeID, versionName, objectStore.Name), nil
	case ScopeWorkflow:
		return fmt.Sprintf("object-store_%s_%s_%s_%s", runtimeID, versionName, workflowName, objectStore.Name), nil
	default:
		return "", ErrInvalidObjectStoreScope
	}
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

func (m *NatsManager) getNodesStreamConfig(stream string, nodes []*Node) NodesStreamConfig {
	nodesConfig := NodesStreamConfig{}
	for _, node := range nodes {
		nodesConfig[node.Name] = NodeStreamConfig{
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

func (m *NatsManager) validateWorkflows(workflows []*Workflow) error {
	for _, workflow := range workflows {
		if err := workflow.Validate(); err != nil {
			return err
		}
	}
	return nil
}
