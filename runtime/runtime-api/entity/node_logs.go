package entity

type NodeLog struct {
	ID           string `bson:"_id"`
	Date         string `bson:"date"`
	Message      string `bson:"message"`
	Level        string `bson:"level"`
	PodID        string `bson:"podId"`
	NodeID       string `bson:"nodeId"`
	NodeName     string `bson:"nodeName"`
	VersionID    string `bson:"versionId"`
	VersionName  string `bson:"versionName"`
	WorkflowID   string `bson:"workflowId"`
	WorkflowName string `bson:"workflowName"`
}
