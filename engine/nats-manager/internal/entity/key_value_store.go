package entity

type WorkflowKeyValueStores struct {
	WorkflowStore string
	Nodes         map[string]string
}

type VersionKeyValueStores struct {
	ProjectStore    string
	WorkflowsStores map[string]*WorkflowKeyValueStores
}
