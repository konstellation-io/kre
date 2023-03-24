package entity

import (
	"fmt"
)

type VersionConfig struct {
	KeyValueStore string

	StreamsConfig      *VersionStreamsConfig
	ObjectStoresConfig *VersionObjectStoresConfig
	KeyValueStoresConfig *KeyValueStoresConfig
}

func NewVersionConfig(streamsConfig *VersionStreamsConfig, objectStoresConfig *VersionObjectStoresConfig, keyValueStoresConfig *KeyValueStoresConfig) *VersionConfig {
	return &VersionConfig{
		StreamsConfig:      streamsConfig,
		ObjectStoresConfig: objectStoresConfig,
		KeyValueStoresConfig: keyValueStoresConfig,
	}
}

func (w *WorkflowStreamConfig) GetNodeStreamConfig(node string) (*NodeStreamConfig, error) {
	return w.GetNodeConfig(node)
}

func (v *VersionConfig) GetNodeObjectStoreConfig(workflow, node string) *string {
	w, ok := v.ObjectStoresConfig.Workflows[workflow]
	if !ok {
		return nil
	}

	n, ok := w[node]
	if !ok {
		return nil
	}

	return &n
}

func (v *VersionConfig) GetWorkflowStreamConfig(workflow string) (*WorkflowStreamConfig, error) {
	w, ok := v.StreamsConfig.Workflows[workflow]
	if !ok {
		return nil, fmt.Errorf("workflow %q stream config not found", workflow)
	}

	return w, nil
}

func (v *VersionConfig) GetWorkflowKeyValueStoresConfig(workflow string) (*WorkflowKeyValueStores, error) {
	w, ok := v.KeyValueStoresConfig.WorkflowsKeyValueStores[workflow]
	if !ok {
		return nil, fmt.Errorf("workflow %q stream config not found", workflow)
	}

	return w, nil
}
