package entity

type WorkflowsObjectStoresConfig map[string]*WorkflowObjectStoresConfig

type WorkflowObjectStoresConfig struct {
	Nodes NodesObjectStoresConfig
}

type NodesObjectStoresConfig map[string]string
