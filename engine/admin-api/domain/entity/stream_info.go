package entity

type VersionStreamConfig map[string]WorkflowStreamConfig

type WorkflowStreamConfig struct {
	Stream string
	Nodes  map[string]NodeStreamConfig
}

type NodeStreamConfig struct {
	Subject       string
	Subscriptions []string
}

type StreamInfo struct {
	Stream        string
	NodesSubjects map[string]string
}
