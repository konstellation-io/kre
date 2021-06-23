package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/konstellation-io/kre/engine/mongo-writer/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/mongodb"
	"github.com/konstellation-io/kre/engine/mongo-writer/nats"
	"github.com/konstellation-io/kre/libs/simplelogger"
)

const natsSubjectLogs = "mongo_writer_logs"
const natsSubjectData = "mongo_writer"
const showStatsSeconds = 5

type Writer struct {
	cfg    *config.Config
	logger *simplelogger.SimpleLogger
	mongoM *mongodb.MongoDB
	natsM  *nats.NATSManager
}

func NewWriter(
	cfg *config.Config,
	logger *simplelogger.SimpleLogger,
	mongoM *mongodb.MongoDB,
	natsM *nats.NATSManager,
) *Writer {
	return &Writer{cfg: cfg, logger: logger, mongoM: mongoM, natsM: natsM}
}

func (w *Writer) Start() {
	w.connectClients()
	defer w.disconnectClients()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logsCh := w.natsM.SubscribeToChannel(natsSubjectLogs)
	dataCh := w.natsM.SubscribeToChannel(natsSubjectData)

	go w.startShowingStats(ctx)

	logsProcessor := NewLogsProcessor(w.cfg, w.logger, w.mongoM, w.natsM)
	dataProcessor := NewDataProcessor(w.cfg, w.logger, w.mongoM, w.natsM)

	go logsProcessor.ProcessMsgs(ctx, logsCh)
	go dataProcessor.ProcessMsgs(ctx, dataCh)

	// Handle sigterm and await termChan signal
	termChan := make(chan os.Signal, 1)
	signal.Notify(termChan, syscall.SIGINT, syscall.SIGTERM)
	<-termChan
	log.Println("Shutdown signal received")
}

func (w *Writer) connectClients() {
	err := w.mongoM.Connect()
	if err != nil {
		w.logger.Errorf("Error connecting to MongoDB: %s", err)
		os.Exit(1)
	}

	err = w.natsM.Connect()
	if err != nil {
		w.logger.Errorf("Error connecting to NATS: %s", err)
		os.Exit(1)
	}
}

func (w *Writer) disconnectClients() {
	w.logger.Info("Disconnecting clients...")

	err := w.mongoM.Disconnect()
	if err != nil {
		w.logger.Errorf("Error disconnecting from MongoDB: %s", err)
	}

	w.natsM.Disconnect()
}

// startShowingStats logs every N sec the stats.
func (w *Writer) startShowingStats(ctx context.Context) {
	msgProcessed := 0

	for {
		select {
		case <-ctx.Done():
			break
		case <-time.Tick(time.Duration(showStatsSeconds) * time.Second):
			if w.natsM.TotalMsgs == msgProcessed {
				continue
			}

			msgProcessed = w.natsM.TotalMsgs
			w.logger.Debugf("NATS: %6d messages. MongoDB: %6d inserted documents",
				w.natsM.TotalMsgs,
				w.mongoM.TotalInserts,
			)
		}
	}
}
