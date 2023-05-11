package entity

import "fmt"

type KeyValueStoresConfig struct {
	ProjectKeyValueStore    string
	WorkflowsKeyValueStores WorkflowsKeyValueStoresConfig
}

type WorkflowsKeyValueStoresConfig map[string]*WorkflowKeyValueStores

type WorkflowKeyValueStores struct {
	WorkflowKeyValueStore string
	NodesKeyValueStores   map[string]string
}

func (w *WorkflowKeyValueStores) GetNodeKeyValueStore(node string) (string, error) {
	store, ok := w.NodesKeyValueStores[node]
	if !ok {
		//nolint:goerr113 // error needs to be dynamic
		return "", fmt.Errorf("missing key value store for node %q", node)
	}

	return store, nil
}
