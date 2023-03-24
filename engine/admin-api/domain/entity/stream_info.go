package entity

import "fmt"

const entrypointNodeName = "entrypoint"

type VersionStreamsConfig struct {
	KeyValueStore string
	Workflows     map[string]*WorkflowStreamConfig
}

type WorkflowStreamConfig struct {
	Stream            string
	Nodes             map[string]*NodeStreamConfig
	EntrypointSubject string
	KeyValueStore     string
}

func (w *WorkflowStreamConfig) GetNodeConfig(nodeName string) (*NodeStreamConfig, error) {
	nodeConfig, ok := w.Nodes[nodeName]
	if !ok {
		return nil, fmt.Errorf("error obtaining stream config for node %q", nodeName)
	}
	return nodeConfig, nil
}

func (w *WorkflowStreamConfig) GetEntrypointSubject() (string, error) {
	entrypointConfig, err := w.GetNodeConfig(entrypointNodeName)
	if err != nil {
		return "", err
	}
	return entrypointConfig.Subject, nil
}

type NodeStreamConfig struct {
	Subject       string
	ObjectStore   *string
	KeyValueStore string
	Subscriptions []string
}

type StreamInfo struct {
	Stream        string
	NodesSubjects map[string]string
}
