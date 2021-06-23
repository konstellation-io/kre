package main

import (
	"github.com/konstellation-io/kre/engine/mongo-writer/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/mongodb"
	"github.com/konstellation-io/kre/engine/mongo-writer/nats"
	"github.com/konstellation-io/kre/libs/simplelogger"
)

func main() {
	cfg := config.NewConfig()
	logger := simplelogger.New(simplelogger.LevelDebug)
	mongoM := mongodb.NewMongoManager(cfg, logger)
	natsM := nats.NewNATSManager(cfg, logger)

	writer := NewWriter(cfg, logger, mongoM, natsM)
	writer.Start()
}
