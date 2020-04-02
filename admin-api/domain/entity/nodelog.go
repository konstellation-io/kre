package entity

import (
	"time"
)

type NodeLog struct {
	ID        string
	Date      string
	Level     string
	Message   string
	VersionId string
	NodeId    string
	PodId     string
	NodeName  string
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
