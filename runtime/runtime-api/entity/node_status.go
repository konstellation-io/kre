package entity

type NodeStatus string

const (
	NodeStatusStarting NodeStatus = "STARTING"
	NodeStatusStarted  NodeStatus = "STARTED"
	NodeStatusStopped  NodeStatus = "STOPPED"
	NodeStatusError    NodeStatus = "ERROR"
)

type Node struct {
	ID     string
	Status NodeStatus
	Name   string
}
