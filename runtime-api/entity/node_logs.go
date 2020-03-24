package entity

type NodeLog struct {
	ID          string `bson:"_id"`
	Date        string `bson:"date"`
	VersionName string `bson:"versionName"`
	NodeID      string `bson:"nodeId"`
	PodID       string `bson:"podId"`
	Message     string `bson:"message"`
	Level       string `bson:"level"`
	WorkflowID  string `bson:"workflowId"`
	NodeName    string `bson:"nodeName"`
}
