package entity

import "time"

type NodeLog struct {
	ID           string   `bson:"_id"`
	Date         string   `bson:"date"`
	Message      string   `bson:"message"`
	Level        LogLevel `bson:"level"`
	PodID        string   `bson:"podId"`
	NodeID       string   `bson:"nodeId" gqlgen:"nodeId"`
	NodeName     string   `bson:"nodeName"`
	VersionID    string   `bson:"versionId"`
	VersionName  string   `bson:"versionName"`
	WorkflowID   string   `bson:"workflowId" gqlgen:"workflowId"`
	WorkflowName string   `bson:"workflowName"`
}

type SearchLogsOptions struct {
	StartDate time.Time
	EndDate   time.Time
	Search    *string
	Levels    []LogLevel
	NodeIDs   []string
	Cursor    *string
}

type SearchLogsResult struct {
	Cursor string
	Logs   []*NodeLog
}

type LogFilters struct {
	StartDate string     `json:"startDate"`
	EndDate   *string    `json:"endDate"`
	Search    *string    `json:"search"`
	Levels    []LogLevel `json:"levels"`
	NodeIDs   []string   `json:"nodeIds"`
}

type LogLevel string

const (
	LogLevelError LogLevel = "ERROR"
	LogLevelWarn  LogLevel = "WARN"
	LogLevelInfo  LogLevel = "INFO"
	LogLevelDebug LogLevel = "DEBUG"
)

func (e LogLevel) IsValid() bool {
	switch e {
	case LogLevelError, LogLevelWarn, LogLevelInfo, LogLevelDebug:
		return true
	}
	return false
}

func (e LogLevel) String() string {
	return string(e)
}
