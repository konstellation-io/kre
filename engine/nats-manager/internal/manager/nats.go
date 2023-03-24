package manager

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/entity"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/errors"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/logging"
)

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/${GOFILE} -package=mocks

type Client interface {
	CreateStream(streamConfig *entity.StreamConfig) error
	CreateObjectStore(objectStore string) error
	GetObjectStoreNames(optFilter ...*regexp.Regexp) ([]string, error)
	GetStreamNames(optFilter ...*regexp.Regexp) ([]string, error)
	DeleteStream(stream string) error
	DeleteObjectStore(stream string) error
	CreateKeyValueStore(keyValueStore string) error
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
			return nil, fmt.Errorf("error creating stream %q: %w", stream, err)
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
		return m.joinWithUnderscores(runtimeID, versionName, objectStore.Name), nil
	case entity.ScopeWorkflow:
		return m.joinWithUnderscores(runtimeID, versionName, workflowName, objectStore.Name), nil
	default:
		return "", errors.ErrInvalidObjectStoreScope
	}
}

func (m *NatsManager) DeleteStreams(runtimeID, versionName string) error {
	versionStreamsRegExp, err := m.getVersionStreamFilter(runtimeID, versionName)
	if err != nil {
		return fmt.Errorf("error compiling regex: %w", err)
	}

	allStreams, err := m.client.GetStreamNames(versionStreamsRegExp)
	if err != nil {
		return fmt.Errorf("error getting streams: %w", err)
	}
	for _, stream := range allStreams {
		err := m.client.DeleteStream(stream)
		if err != nil {
			return fmt.Errorf("error deleting stream %q: %w", stream, err)
		}
	}
	return nil
}

func (m *NatsManager) DeleteObjectStores(runtimeID, versionName string) error {
	versionObjStoreRegExp, err := m.getVersionStreamFilter(runtimeID, versionName)
	if err != nil {
		return fmt.Errorf("error compiling regex: %w", err)
	}

	allObjectStores, err := m.client.GetObjectStoreNames(versionObjStoreRegExp)
	if err != nil {
		return fmt.Errorf("error getting object store names: %w", err)
	}

	for _, objectStore := range allObjectStores {
		m.logger.Debugf("Deleting object store %q", objectStore)

		err := m.client.DeleteObjectStore(objectStore)
		if err != nil {
			return fmt.Errorf("error deleting object store %q: %w", objectStore, err)
		}
	}

	return nil
}

func (m *NatsManager) getStreamName(runtimeID, versionName, workflowEntrypoint string) string {
	return m.joinWithUnderscores(runtimeID, versionName, workflowEntrypoint)
}

func (m *NatsManager) CreateKeyValueStores(
	runtimeID,
	versionName string,
	workflows []*entity.Workflow,
) (*entity.VersionKeyValueStores, error) {
	if len(workflows) <= 0 {
		return nil, errors.ErrNoWorkflowsDefined
	}

	m.logger.Info("Creating key-value stores")

	// create key-value store for project
	projectKeyValueStore, err := m.getKeyValueStoreName(runtimeID, versionName, "", "", entity.ScopeProject)
	if err != nil {
		return nil, errors.ErrEmptyEntrypointService
	}

	err = m.client.CreateKeyValueStore(projectKeyValueStore)
	if err != nil {
		return nil, fmt.Errorf("error creating key-value store %q: %w", projectKeyValueStore, err)
	}

	workflowsKeyValueStores := map[string]*entity.WorkflowKeyValueStores{}

	for _, workflow := range workflows {
		// create key-value store for workflow
		workflowKeyValueStore, err := m.getKeyValueStoreName(runtimeID, versionName, workflow.Name, "", entity.ScopeWorkflow)
		if err != nil {
			return nil, err
		}

		err = m.client.CreateKeyValueStore(workflowKeyValueStore)
		if err != nil {
			return nil, fmt.Errorf("error creating key-value store %q: %w", workflowKeyValueStore, err)
		}

		nodesKeyValueStores := map[string]string{}
		for _, node := range workflow.Nodes {
			// create key-value store for node
			nodeKeyValueStore, err := m.getKeyValueStoreName(runtimeID, versionName, workflow.Name, node.Name, entity.ScopeNode)
			if err != nil {
				return nil, err
			}

			err = m.client.CreateKeyValueStore(nodeKeyValueStore)
			if err != nil {
				return nil, fmt.Errorf("error creating key-value store %q: %w", nodeKeyValueStore, err)
			}

			nodesKeyValueStores[node.Name] = nodeKeyValueStore
		}

		workflowsKeyValueStores[workflow.Name] = &entity.WorkflowKeyValueStores{
			WorkflowStore: workflowKeyValueStore,
			Nodes:         nodesKeyValueStores,
		}
	}

	return &entity.VersionKeyValueStores{
		ProjectStore:    projectKeyValueStore,
		WorkflowsStores: workflowsKeyValueStores,
	}, nil
}

func (m *NatsManager) getKeyValueStoreName(
	runtimeID, versionName, workflowName, nodeName string,
	keyValueStore entity.ObjectStoreScope,
) (string, error) {
	switch keyValueStore {
	case entity.ScopeProject:
		return fmt.Sprintf("key-store_%s_%s", runtimeID, versionName), nil
	case entity.ScopeWorkflow:
		return fmt.Sprintf("key-store_%s_%s_%s", runtimeID, versionName, workflowName), nil
	case entity.ScopeNode:
		return fmt.Sprintf("key-store_%s_%s_%s_%s", runtimeID, versionName, workflowName, nodeName), nil
	default:
		return "", errors.ErrInvalidKeyValueStoreScope
	}
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

func (m *NatsManager) getVersionStreamFilter(runtimeID, versionName string) (*regexp.Regexp, error) {
	return regexp.Compile(fmt.Sprintf("^%s", m.joinWithUnderscores(runtimeID, versionName, ".*")))
}

func (m *NatsManager) joinWithUnderscores(elements ...string) string {
	return strings.Join(elements, "_")
}
