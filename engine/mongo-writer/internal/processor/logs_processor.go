package processor

import (
	"context"

	"github.com/konstellation-io/kre/engine/mongo-writer/internal/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/logging"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/mongodb"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/nats"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/parser"

	nc "github.com/nats-io/nats.go"
)

const LogsCollName = "logs"

type LogsProcessor struct {
	cfg             *config.Config
	logger          logging.Logger
	mongoM          mongodb.MongoManager
	natsM           nats.Manager
	fluentbitParser parser.FluentbitMsgParser
}

func NewLogsProcessor(
	cfg *config.Config,
	logger logging.Logger,
	mongoM mongodb.MongoManager,
	natsM nats.Manager,
	fluentbitParser parser.FluentbitMsgParser,
) *LogsProcessor {
	return &LogsProcessor{
		cfg:             cfg,
		logger:          logger,
		mongoM:          mongoM,
		natsM:           natsM,
		fluentbitParser: fluentbitParser,
	}
}

func (l *LogsProcessor) ProcessMsgs(ctx context.Context, logsCh chan *nc.Msg) {
	for msg := range logsCh {
		l.natsM.IncreaseTotalMsgs(1)

		msgs, err := l.fluentbitParser.Parse(msg.Data)
		if err != nil {
			l.logger.Errorf("Error parsing Fluentbit msg: %s", err)
			continue
		}

		err = l.mongoM.InsertMany(ctx, l.cfg.MongoDB.LogsDBName, LogsCollName, msgs)
		if err != nil {
			l.logger.Errorf("Error inserting msg: %s", err)
		}
	}
}
