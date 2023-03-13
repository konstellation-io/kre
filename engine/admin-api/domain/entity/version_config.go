package entity

import (
	"fmt"
)

type VersionConfig struct {
	KeyValueStore string

	StreamsConfig      *VersionStreamsConfig
	ObjectStoresConfig *VersionObjectStoresConfig
}

func NewVersionConfig(streamsConfig *VersionStreamsConfig, objectStoresConfig *VersionObjectStoresConfig) *VersionConfig {
	return &VersionConfig{
		StreamsConfig:      streamsConfig,
		ObjectStoresConfig: objectStoresConfig,
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
