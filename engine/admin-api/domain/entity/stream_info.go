package entity

import "fmt"

const entrypointNodeName = "entrypoint"

type VersionStreamConfig map[string]WorkflowStreamConfig

type WorkflowStreamConfig struct {
	Stream string
	Nodes  map[string]NodeStreamConfig
}

func (w *WorkflowStreamConfig) GetNodeConfig(nodeName string) (NodeStreamConfig, error) {
	nodeConfig, ok := w.Nodes[nodeName]
	if !ok {
		return NodeStreamConfig{}, fmt.Errorf("error obtaining stream config for node \"%s\"", nodeName)
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
	Subscriptions []string
}

type StreamInfo struct {
	Stream        string
	NodesSubjects map[string]string
}
