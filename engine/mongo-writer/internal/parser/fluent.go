package parser

import (
	"encoding/json"
	"regexp"
	"time"
)

type LogMsg struct {
	Date         string
	Level        string
	Message      string
	WorkflowID   string
	WorkflowName string
	NodeID       string
	NodeName     string
	VersionID    string
	VersionName  string
}

var logRegexp = regexp.MustCompile(`^.+ (ERROR|WARN|INFO|DEBUG) (.+)$`)

func FluentbitMsgParser(data []byte) ([]LogMsg, error) {
	var msgList []interface{}

	err := json.Unmarshal(data, &msgList)
	if err != nil {
		return nil, err
	}

	result := make([]LogMsg, len(msgList))

	for idx, msgItem := range msgList {
		msgItemArray := msgItem.([]interface{})
		msgTime := msgItemArray[0].(float64)
		msgData := msgItemArray[1].(map[string]interface{})

		date := time.Unix(0, int64(msgTime)*int64(time.Second)).Format(time.RFC3339)
		level := "INFO"
		message := ""

		if val, ok := msgData["logtime"].(string); ok {
			date = val
		}

		if val, ok := msgData["level"].(string); ok {
			level = val
		}

		if val, ok := msgData["capture"].(string); ok {
			message = val
		}

		// Extract level and message from log text for texts like:
		//   INFO:kre-runner:connecting to NATS at 'kre-nats:4222'
		if logRegexp.MatchString(message) {
			r := logRegexp.FindAllStringSubmatch(message, -1)
			level = r[0][1]
			message = r[0][2]
		}

		result[idx] = LogMsg{
			Date:         date,
			Level:        level,
			Message:      message,
			WorkflowID:   msgData["workflowId"].(string),
			WorkflowName: msgData["workflowName"].(string),
			NodeID:       msgData["nodeId"].(string),
			NodeName:     msgData["nodeName"].(string),
			VersionID:    msgData["versionId"].(string),
			VersionName:  msgData["versionName"].(string),
		}
	}

	return result, nil
}
