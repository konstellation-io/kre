package logging

import (
	"encoding/json"
	nc "github.com/nats-io/nats.go"
	"gitlab.com/konstellation/kre/mongo-writer/mongodb"
	"go.mongodb.org/mongo-driver/bson"
	"regexp"
	"time"
)

var logRegexp = regexp.MustCompile(`^([^:]+):[^:]+:(.+)$`)

type FluentBitNatsMsg struct {
	Time float64
	Data bson.M
}

func FluentbitMsgParser(msg *nc.Msg) (*mongodb.InsertsMap, error) {
	var msgList bson.A

	err := json.Unmarshal(msg.Data, &msgList)
	if err != nil {
		return nil, err
	}

	list := mongodb.InsertsMap{}

	for _, raw := range msgList {
		x := raw.([]interface{})

		msg := FluentBitNatsMsg{
			x[0].(float64),
			bson.M(x[1].(map[string]interface{})),
		}

		coll := msg.Data["coll"].(string)
		doc := bson.M(msg.Data["doc"].(map[string]interface{}))

		level := "INFO"
		message := doc["log"].(string)
		if logRegexp.MatchString(message) {
			r := logRegexp.FindAllStringSubmatch(message, -1)
			level = r[0][1]
			message = r[0][2]
		}

		doc["level"] = level
		doc["message"] = message
		doc["date"] = time.Unix(0, int64(msg.Time*1000)*int64(time.Millisecond)).Format(time.RFC3339)

		delete(doc, "log")

		list[coll] = append(list[coll], doc)
	}

	return &list, nil
}
