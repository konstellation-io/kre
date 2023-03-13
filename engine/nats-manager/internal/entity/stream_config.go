package entity

type WorkflowsStreamsConfig map[string]*StreamConfig

type StreamConfig struct {
	Stream            string
	Nodes             NodesStreamConfig
	EntrypointSubject string
}

type NodesStreamConfig map[string]NodeStreamConfig

type NodeStreamConfig struct {
	Subject       string
	Subscriptions []string
}
