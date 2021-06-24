package main

import (
	"context"

	"github.com/konstellation-io/kre/engine/mongo-writer/internal/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/logging"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/mongodb"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/nats"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/parser"

	nc "github.com/nats-io/nats.go"
)

const logsCollName = "logs"

type LogsProcessor struct {
	cfg    *config.Config
	logger logging.Logger
	mongoM *mongodb.MongoDB
	natsM  *nats.NATSManager
}

func NewLogsProcessor(
	cfg *config.Config,
	logger logging.Logger,
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

		msgs, err := parser.FluentbitMsgParser(msg.Data)
		if err != nil {
			l.logger.Errorf("Error parsing Fluentbit msg: %s", err)
			continue
		}

		err = l.mongoM.InsertMessages(ctx, l.cfg.MongoDB.LogsDBName, logsCollName, msgs)
		if err != nil {
			l.logger.Errorf("Error inserting msg: %s", err)
		}
	}
}
