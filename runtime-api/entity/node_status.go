package entity

type NodeStatus string

const (
	NodeStatusStarted NodeStatus = "STARTED"
	NodeStatusStopped NodeStatus = "STOPPED"
	NodeStatusError   NodeStatus = "ERROR"
)

type VersionNodeStatus struct {
	NodeID  string
	Status  NodeStatus
	Message string
}
