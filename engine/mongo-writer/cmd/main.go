package main

import (
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/logging"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/mongodb"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/nats"
)

func main() {
	cfg := config.NewConfig()
	logger := logging.NewLogger(cfg.LogLevel)
	mongoM := mongodb.NewMongoManager(cfg, logger)
	natsM := nats.NewManager(cfg, logger)

	writer := NewWriter(cfg, logger, mongoM, natsM)
	writer.Start()
}
