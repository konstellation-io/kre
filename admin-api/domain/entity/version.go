package entity

import (
	"time"
)

type Edge struct {
	ID       string `bson:"id"`
	FromNode string `bson:"fromNode"`
	ToNode   string `bson:"toNode"`
}

type Node struct {
	ID     string `bson:"id"`
	Name   string `bson:"name"`
	Image  string `bson:"image"`
	Src    string `bson:"src"`
	Status string `bson:"status"`
}

type NodeStatus string

const (
	NodeStatusStarted NodeStatus = "STARTED"
	NodeStatusStopped NodeStatus = "STOPPED"
	NodeStatusError   NodeStatus = "ERROR"
)

func (n *NodeStatus) GetStatus(key string) NodeStatus {
	var status NodeStatus
	switch key {
	case "STARTED":
		status = NodeStatusStarted
	case "STOPPED":
		status = NodeStatusStopped
	case "ERROR":
		status = NodeStatusError
	}

	return status
}

type VersionNodeStatus struct {
	NodeID  string
	Status  NodeStatus
	Message string
}

type Workflow struct {
	Name       string `bson:"name"`
	Entrypoint string `bson:"entrypoint"`
	Nodes      []Node `bson:"nodes"`
	Edges      []Edge `bson:"edges"`
}

type Entrypoint struct {
	ProtoFile string `bson:"proto"`
	Image     string `bson:"image"`
	Src       string `bson:"src"`
}

type ConfigVar struct {
	Key   string `bson:"key"`
	Value string `bson:"value"`
	Type  string `bson:"type"`
}

type VersionConfig struct {
	Completed bool         `bson:"completed"`
	Vars      []*ConfigVar `bson:"vars"`
}

type Version struct {
	ID        string `bson:"_id"`
	RuntimeID string `bson:"runtimeId"`

	Name        string `bson:"name"`
	Description string `bson:"description"`

	CreationDate   time.Time `bson:"creationDate"`
	CreationAuthor string    `bson:"creationAuthor"`

	ActivationDate   *time.Time `bson:"activationDate"`
	ActivationUserID *string    `bson:"activationUserId"`

	Status string `bson:"status"`

	Config     VersionConfig `bson:"config"`
	Entrypoint Entrypoint    `bson:"entrypoint"`
	Workflows  []Workflow    `bson:"workflows"`
}
