package main

import (
	"context"

	"github.com/konstellation-io/kre/engine/mongo-writer/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/logging"
	"github.com/konstellation-io/kre/engine/mongo-writer/mongodb"
	"github.com/konstellation-io/kre/engine/mongo-writer/nats"
	"github.com/konstellation-io/kre/libs/simplelogger"
	nc "github.com/nats-io/nats.go"
)

type LogsProcessor struct {
	cfg    *config.Config
	logger *simplelogger.SimpleLogger
	mongoM *mongodb.MongoDB
	natsM  *nats.NATSManager
}

func NewLogsProcessor(
	cfg *config.Config,
	logger *simplelogger.SimpleLogger,
	mongoM *mongodb.MongoDB,
	natsM *nats.NATSManager,
) *LogsProcessor {
	return &LogsProcessor{
		cfg:    cfg,
		logger: logger,
		mongoM: mongoM,
		natsM:  natsM,
	}
}

func (l *LogsProcessor) ProcessMsgs(ctx context.Context, logsCh chan *nc.Msg) {
	for msg := range logsCh {
		l.natsM.TotalMsgs++

		msgs, err := logging.FluentbitMsgParser(msg)
		if err != nil {
			l.logger.Errorf("Error parsing Fluentbit msg: %s", err)
			continue
		}

		err = l.mongoM.InsertMessages(ctx, l.cfg.MongoDB.LogsDBName, msgs)
		if err != nil {
			l.logger.Errorf("Error inserting msg: %s", err)
		}
	}
}
