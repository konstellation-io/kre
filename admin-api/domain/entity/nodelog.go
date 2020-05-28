package entity

import (
	"time"
)

type NodeLog struct {
	ID           string
	Date         string
	Level        LogLevel
	Message      string
	NodeID       string `gqlgen:"nodeId"`
	NodeName     string
	WorkflowID   string `gqlgen:"workflowId"`
	WorkflowName string
}

type SearchLogsOptions struct {
	Cursor      string
	StartDate   time.Time
	EndDate     time.Time
	VersionName string
	WorkflowID  string
	NodeID      string
	Level       string
	Search      string
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
	NodeIds   []string   `json:"nodeIds"`
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
