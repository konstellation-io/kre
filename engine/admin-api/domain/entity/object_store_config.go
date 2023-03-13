package entity

type VersionObjectStoresConfig struct {
	Workflows WorkflowsObjectStoresConfig
}

type WorkflowsObjectStoresConfig map[string]NodesObjectStoresConfig

type NodesObjectStoresConfig map[string]string
