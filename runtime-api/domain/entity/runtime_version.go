package entity

type Edge struct {
	ID       string
	FromNode string
	ToNode   string
}

type Node struct {
	ID     string
	Name   string
	Image  string
	Src    string
	Config map[string]string
}

type Workflow struct {
	Name       string
	Entrypoint string
	Nodes      []*Node
	Edges      []*Edge
}

type Entrypoint struct {
	ProtoFile string
	Image     string
	Src       string
	Config    map[string]interface{}
}
type Config struct {
	Key   string
	Value string
}

type Version struct {
	Name       string
	Entrypoint Entrypoint
	Config     []*Config
	Workflows  []Workflow
	Status     string
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
