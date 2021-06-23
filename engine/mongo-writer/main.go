package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"
	nc "github.com/nats-io/nats.go"

	"github.com/konstellation-io/kre/engine/mongo-writer/logging"

	"github.com/konstellation-io/kre/engine/mongo-writer/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/mongodb"
	"github.com/konstellation-io/kre/engine/mongo-writer/nats"
)

const natsSubjectLogs = "mongo_writer_logs"
const natsSubjectData = "mongo_writer"
const showStatsSeconds = 5

type DataMsg struct {
	Coll string      `json:"coll"`
	Doc  interface{} `json:"doc"`
}

type DataMsgResponse struct {
	Success bool `json:"success"`
}

func main() {
	cfg := config.NewConfig()
	logger := simplelogger.New(simplelogger.LevelDebug)
	mongoM := mongodb.NewMongoManager(cfg, logger)
	natsM := nats.NewNATSManager(cfg, logger)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	connectClients(mongoM, natsM, logger)
	defer disconnectClients(mongoM, natsM, logger)

	logsCh := natsM.SubscribeToChannel(natsSubjectLogs)
	dataCh := natsM.SubscribeToChannel(natsSubjectData)

	startShowingStats(ctx, mongoM, natsM, logger)

	go processLogsMsgs(ctx, logsCh, mongoM, natsM, cfg, logger)
	go processDataMsgs(ctx, dataCh, mongoM, natsM, cfg, logger)

	// Handle sigterm and await termChan signal
	termChan := make(chan os.Signal)
	signal.Notify(termChan, syscall.SIGINT, syscall.SIGTERM)
	<-termChan
	log.Println("Shutdown signal received")
}

func connectClients(mongoM *mongodb.MongoDB, natsM *nats.NATSManager, logger *simplelogger.SimpleLogger) {
	err := mongoM.Connect()
	if err != nil {
		logger.Errorf("Error connecting to MongoDB: %s", err)
		os.Exit(1)
	}

	err = natsM.Connect()
	if err != nil {
		logger.Errorf("Error connecting to NATS: %s", err)
		os.Exit(1)
	}
}

func disconnectClients(mongoM *mongodb.MongoDB, natsM *nats.NATSManager, logger *simplelogger.SimpleLogger) {
	fmt.Println("Disconnecting clients...")

	err := mongoM.Disconnect()
	if err != nil {
		logger.Errorf("Error disconnecting from MongoDB: %s", err)
	}

	natsM.Disconnect()
}

// startShowingStats logs every N sec the stats.
func startShowingStats(ctx context.Context, mongoM *mongodb.MongoDB, natsM *nats.NATSManager, logger *simplelogger.SimpleLogger) {
	go func() {
		msgProcessed := 0
		for {
			select {
			case <-ctx.Done():
				break
			case <-time.Tick(time.Duration(showStatsSeconds) * time.Second):
				if natsM.TotalMsgs == msgProcessed {
					continue
				}

				msgProcessed = natsM.TotalMsgs
				logger.Debugf("NATS: %6d messages. MongoDB: %6d inserted documents",
					natsM.TotalMsgs,
					mongoM.TotalInserts,
				)
			}
		}
	}()
}

func processLogsMsgs(ctx context.Context, logsCh chan *nc.Msg, mongoM *mongodb.MongoDB, natsM *nats.NATSManager, cfg *config.Config, logger *simplelogger.SimpleLogger) {
	for msg := range logsCh {
		natsM.TotalMsgs += 1

		msgs, err := logging.FluentbitMsgParser(msg)
		if err != nil {
			logger.Errorf("Error parsing Fluentbit msg: %s", err)
		}

		err = mongoM.InsertMessages(ctx, cfg.MongoDB.LogsDBName, msgs)
		if err != nil {
			logger.Errorf("Error inserting msg: %s", err)
		}
	}
}

func processDataMsgs(ctx context.Context, dataCh chan *nc.Msg, mongoM *mongodb.MongoDB, natsM *nats.NATSManager, cfg *config.Config, logger *simplelogger.SimpleLogger) {
	for msg := range dataCh {
		natsM.TotalMsgs += 1

		dataMsg := DataMsg{}

		var (
			err  error
			data []byte
		)

		if isCompressed(msg.Data) {
			data, err = uncompress(msg.Data)
			if err != nil {
				logger.Errorf("error uncompressing the message: %s", err)
				continue
			}
		} else {
			data = msg.Data
		}

		err = json.Unmarshal(data, &dataMsg)
		if err != nil {
			logger.Errorf("Error parsing data msg: %s", err)
			continue
		}

		// MongoDB ACK needed to reply to NATS
		res := DataMsgResponse{
			Success: true,
		}

		err = mongoM.InsertOne(ctx, cfg.MongoDB.DataDBName, dataMsg.Coll, dataMsg.Doc)
		if err != nil {
			logger.Errorf("Error inserting data msg: %s", err)
			res.Success = false
		}

		resBytes, err := json.Marshal(res)
		if err != nil {
			logger.Errorf("Error marshaling the data msg response: %s", err)
		}

		err = msg.Respond(resBytes)
		if err != nil {
			logger.Errorf("Error replaying to the data msg: %s", err)
		}
	}
}
