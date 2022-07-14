package entity

import (
	"time"
)

type VersionStatus string

const (
	VersionStatusCreating  VersionStatus = "CREATING"
	VersionStatusCreated   VersionStatus = "CREATED"
	VersionStatusStarting  VersionStatus = "STARTING"
	VersionStatusStarted   VersionStatus = "STARTED"
	VersionStatusPublished VersionStatus = "PUBLISHED"
	VersionStatusStopping  VersionStatus = "STOPPING"
	VersionStatusStopped   VersionStatus = "STOPPED"
	VersionStatusError     VersionStatus = "ERROR"
)

func (e VersionStatus) IsValid() bool {
	switch e {
	case VersionStatusCreating,
		VersionStatusCreated,
		VersionStatusStarting,
		VersionStatusStarted,
		VersionStatusPublished,
		VersionStatusStopping,
		VersionStatusStopped,
		VersionStatusError:
		return true
	}
	return false
}

func (e VersionStatus) String() string {
	return string(e)
}

type ConfigurationVariableType string

const (
	ConfigurationVariableTypeVariable ConfigurationVariableType = "VARIABLE"
	ConfigurationVariableTypeFile     ConfigurationVariableType = "FILE"
)

func (e ConfigurationVariableType) IsValid() bool {
	switch e {
	case ConfigurationVariableTypeVariable, ConfigurationVariableTypeFile:
		return true
	}
	return false
}

func (e ConfigurationVariableType) String() string {
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
	GPU    bool       `bson:"gpu"`
	Status NodeStatus `bson:"-"` // This field value is calculated in k8s
}

type NodeStatus string

const (
	NodeStatusStarting NodeStatus = "STARTING"
	NodeStatusStarted  NodeStatus = "STARTED"
	NodeStatusStopped  NodeStatus = "STOPPED"
	NodeStatusError    NodeStatus = "ERROR"
)

func (e NodeStatus) IsValid() bool {
	switch e {
	case NodeStatusStarting, NodeStatusStarted, NodeStatusStopped, NodeStatusError:
		return true
	}
	return false
}

func (e NodeStatus) String() string {
	return string(e)
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

type ConfigurationVariable struct {
	Key   string                    `bson:"key"`
	Value string                    `bson:"value"`
	Type  ConfigurationVariableType `bson:"type"`
}

type VersionConfig struct {
	Completed bool                     `bson:"completed"`
	Vars      []*ConfigurationVariable `bson:"vars"`
}

type Version struct {
	ID          string `bson:"_id"`
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

	HasDoc bool     `bson:"hasDoc"`
	Errors []string `bson:"errors"`
}

func (v Version) PublishedOrStarted() bool {
	switch v.Status {
	case VersionStatusStarted,
		VersionStatusPublished:
		return true
	}
	return false
}

func (v Version) CanBeStarted() bool {
	switch v.Status {
	case VersionStatusCreated,
		VersionStatusStopped:
		return true
	}
	return false
}

func (v Version) CanBeStopped() bool {
	switch v.Status {
	case VersionStatusStarted:
		return true
	}
	return false
}
