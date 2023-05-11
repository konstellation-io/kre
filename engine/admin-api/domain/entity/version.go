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

//nolint:gocritic
func (e VersionStatus) IsValid() bool {
	return e == VersionStatusCreating || e == VersionStatusCreated || e == VersionStatusStarting ||
		e == VersionStatusStarted || e == VersionStatusPublished || e == VersionStatusStopping ||
		e == VersionStatusStopped || e == VersionStatusError
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
	return e == ConfigurationVariableTypeVariable || e == ConfigurationVariableTypeFile
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
	ID            string       `bson:"id"`
	Name          string       `bson:"name"`
	Image         string       `bson:"image"`
	Src           string       `bson:"src"`
	GPU           bool         `bson:"gpu"`
	Subscriptions []string     `bson:"subscriptions"`
	Replicas      int32        `bson:"replicas" default:"1"`
	ObjectStore   *ObjectStore `bson:"objectStore,omitempty"`
	Status        NodeStatus   `bson:"-"` // This field value is calculated in k8s
}

type ObjectStore struct {
	Name  string `bson:"name"`
	Scope string `bson:"scope"`
}

type NodeStatus string

const (
	NodeStatusStarting NodeStatus = "STARTING"
	NodeStatusStarted  NodeStatus = "STARTED"
	NodeStatusStopped  NodeStatus = "STOPPED"
	NodeStatusError    NodeStatus = "ERROR"
)

func (e NodeStatus) IsValid() bool {
	return e == NodeStatusStarting || e == NodeStatusStarted || e == NodeStatusStopped || e == NodeStatusError
}

func (e NodeStatus) String() string {
	return string(e)
}

type KrtVersion string

const (
	KRTVersionV2 KrtVersion = "v2"
)

func (e KrtVersion) IsValid() bool {
	return e == KRTVersionV2
}

func (e KrtVersion) String() string {
	return string(e)
}

func ParseKRTVersionFromString(str string) (KrtVersion, bool) {
	var krtVersionMap = map[string]KrtVersion{
		KRTVersionV2.String(): KRTVersionV2,
	}

	c, ok := krtVersionMap[str]

	return c, ok
}

type Workflow struct {
	ID         string `bson:"id"`
	Name       string `bson:"name"`
	Entrypoint string `bson:"entrypoint"`
	Nodes      []Node `bson:"nodes"`
	Exitpoint  string `bson:"exitpoint"`
	Stream     string `bson:"-"`
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

type VersionUserConfig struct {
	Completed bool                     `bson:"completed"`
	Vars      []*ConfigurationVariable `bson:"vars"`
}

type Version struct {
	ID          string     `bson:"_id"`
	KrtVersion  KrtVersion `bson:"krtVersion"`
	Name        string     `bson:"name"`
	Description string     `bson:"description"`

	CreationDate   time.Time `bson:"creationDate"`
	CreationAuthor string    `bson:"creationAuthor"`

	PublicationDate   *time.Time `bson:"publicationDate"`
	PublicationUserID *string    `bson:"publicationUserId"`

	Status VersionStatus `bson:"status"`

	Config     VersionUserConfig `bson:"config"`
	Entrypoint Entrypoint        `bson:"entrypoint"`
	Workflows  []*Workflow       `bson:"workflows"`

	HasDoc bool     `bson:"hasDoc"`
	Errors []string `bson:"errors"`
}

func (v Version) PublishedOrStarted() bool {
	return v.Status == VersionStatusStarted || v.Status == VersionStatusPublished
}

func (v Version) CanBeStarted() bool {
	return v.Status == VersionStatusCreated || v.Status == VersionStatusStopped
}

func (v Version) CanBeStopped() bool {
	return v.Status == VersionStatusStarted
}
