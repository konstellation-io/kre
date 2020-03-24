package main

import (
	"encoding/json"
	"fmt"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"os"
	"regexp"
	"time"

	nc "github.com/nats-io/nats.go"
	"go.mongodb.org/mongo-driver/bson"

	"gitlab.com/konstellation/kre/mongo-writer/config"
	"gitlab.com/konstellation/kre/mongo-writer/mongodb"
	"gitlab.com/konstellation/kre/mongo-writer/nats"
)

var logRegexp = regexp.MustCompile(`^([^:]+):[^:]+:(.+)$`)

func main() {
	cfg := config.NewConfig()
	logger := simplelogger.New(simplelogger.LevelDebug)

	mongoCli := mongodb.NewMongoDB(cfg, logger)
	natsCli := nats.NewNats(cfg, logger)

	err := mongoCli.Connect()
	if err != nil {
		logger.Error("MONGO CONN ERROR:" + err.Error())
		os.Exit(1)
	}

	err = natsCli.ConnectNats()
	if err != nil {
		logger.Error("NATS CONN ERROR: " + err.Error())
		os.Exit(1)
	}

	// Mongo KeepAlive
	waitc := make(chan struct{})
	mongoCli.KeepAlive(waitc)

	natsMsgsCh, err := natsCli.SubscribeToChannel("mongo_writer")

	if err != nil {
		shutdownService(mongoCli, natsCli, logger)
		return
	}

	ticker := time.NewTicker(5 * time.Second)

	msgProcessed := 0

out:
	for {
		select {
		case <-waitc:
			// Something disconnected
			shutdownService(mongoCli, natsCli, logger)
			break out

		case <-ticker.C:
			if natsCli.TotalMsgs == msgProcessed {
				continue
			}
			msgProcessed = natsCli.TotalMsgs
			logger.Info(fmt.Sprintf("NATS MSGS: %6d  MONGO INSERTS: %6d documents", natsCli.TotalMsgs, mongoCli.TotalInserts))

		case msg := <-natsMsgsCh:
			natsCli.TotalMsgs += 1
			// FIXME the input messages can be other types than fluentbit message
			msgs, err := fluentbitMsgParser(msg)
			if err != nil {
				logger.Error(fmt.Sprintf("ERROR PARSING MSGS: %s", err.Error()))
				waitc <- struct{}{}
			}

			err = mongoCli.InsertMessages(msgs)
			if err != nil {
				logger.Error(fmt.Sprintf("ERROR INSERTING MSGS: %s", err.Error()))
				waitc <- struct{}{}
			}

		}
	}
}

func shutdownService(mongoCli *mongodb.MongoDB, natsCli *nats.Nats, logger *simplelogger.SimpleLogger) {
	fmt.Println("Shutting down Mongo Writer...")

	err := mongoCli.Disconnect()
	if err != nil {
		logger.Error(fmt.Sprintf("Error while disconnecting mongo: %s", err.Error()))
	}

	err = natsCli.Disconnect()
	if err != nil {
		logger.Error(fmt.Sprintf("Error while disconnecting nats: %s", err.Error()))
	}
}

type FluentBitNatsMsg struct {
	Time float64
	Data bson.M
}

func fluentbitMsgParser(msg *nc.Msg) (*mongodb.InsertsMap, error) {
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
