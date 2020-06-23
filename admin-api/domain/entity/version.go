package entity

import (
	"time"
)

type VersionStatus string

const (
	VersionStatusStarting  VersionStatus = "STARTING"
	VersionStatusStarted   VersionStatus = "STARTED"
	VersionStatusPublished VersionStatus = "PUBLISHED"
	VersionStatusStopped   VersionStatus = "STOPPED"
)

func (e VersionStatus) IsValid() bool {
	switch e {
	case VersionStatusStarting, VersionStatusStarted, VersionStatusPublished, VersionStatusStopped:
		return true
	}
	return false
}

func (e VersionStatus) String() string {
	return string(e)
}

type Edge struct {
	ID       string `bson:"id"`
	FromNode string `bson:"fromNode"`
	ToNode   string `bson:"toNode"`
}

type Node struct {
	ID     string     `bson:"id"`
	Name   string     `bson:"name"`
	Image  string     `bson:"image"`
	Src    string     `bson:"src"`
	Status NodeStatus `bson:"status"`
}

type NodeStatus string

const (
	NodeStatusStarted NodeStatus = "STARTED"
	NodeStatusStopped NodeStatus = "STOPPED"
	NodeStatusError   NodeStatus = "ERROR"
)

func (e NodeStatus) IsValid() bool {
	switch e {
	case NodeStatusStarted, NodeStatusStopped, NodeStatusError:
		return true
	}
	return false
}

func (e NodeStatus) String() string {
	return string(e)
}

func (e *NodeStatus) FromString(key string) NodeStatus {
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
	ID         string `bson:"id"`
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

	PublicationDate   *time.Time `bson:"publicationDate"`
	PublicationUserID *string    `bson:"publicationUserId"`

	Status VersionStatus `bson:"status"`

	Config     VersionConfig `bson:"config"`
	Entrypoint Entrypoint    `bson:"entrypoint"`
	Workflows  []*Workflow   `bson:"workflows"`
}

func (v Version) PublishedOrStarted() bool {
	switch v.Status {
	case VersionStatusStarted,
		VersionStatusPublished:
		return true
	}
	return false
}
