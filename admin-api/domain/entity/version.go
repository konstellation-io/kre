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

// Node Logs
type NodeLogLevel string

const (
	NodeLogLevelInfo  NodeLogLevel = "INFO"
	NodeLogLevelError NodeLogLevel = "ERROR"
)

func (n *NodeLogLevel) GetLogLevel(key string) NodeLogLevel {
	var level NodeLogLevel
	switch key {
	case "STARTED":
		level = NodeLogLevelInfo
	case "STOPPED":
		level = NodeLogLevelError
	}

	return level
}

type NodeLogType string

const (
	NodeLogTypeSystem NodeLogType = "SYSTEM"
	NodeLogTypeApp    NodeLogType = "APP"
)

func (n *NodeLogType) GetLogType(key string) NodeLogType {
	var logType NodeLogType
	switch key {
	case "SYSTEM":
		logType = NodeLogTypeSystem
	case "APP":
		logType = NodeLogTypeApp
	}

	return logType
}

type NodeLog struct {
	Date      string
	Type      NodeLogType
	VersionId string
	NodeId    string
	PodId     string
	Message   string
	Level     NodeLogLevel
}
