package entity

type WorkflowsStreams map[string]*StreamInfo

type StreamInfo struct {
	Stream        string
	NodesSubjects map[string]string
}
