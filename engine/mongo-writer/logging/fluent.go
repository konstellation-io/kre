package logging

import (
	"encoding/json"
	"regexp"
	"time"

	nc "github.com/nats-io/nats.go"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/konstellation-io/kre/engine/mongo-writer/mongodb"
)

const logsCollName = "logs"

var logRegexp = regexp.MustCompile(`^.+ (ERROR|WARN|INFO|DEBUG) (.+)$`)

func FluentbitMsgParser(msg *nc.Msg) (*mongodb.InsertsMap, error) {
	var msgList []interface{}
	err := json.Unmarshal(msg.Data, &msgList)
	if err != nil {
		return nil, err
	}

	result := mongodb.InsertsMap{}
	for _, msgItem := range msgList {
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

		doc := bson.M{
			"date":         date,
			"level":        level,
			"message":      message,
			"workflowId":   msgData["workflowId"],
			"workflowName": msgData["workflowName"],
			"nodeId":       msgData["nodeId"],
			"nodeName":     msgData["nodeName"],
			"versionId":    msgData["versionId"],
			"versionName":  msgData["versionName"],
		}

		result[logsCollName] = append(result[logsCollName], doc)
	}

	return &result, nil
}
