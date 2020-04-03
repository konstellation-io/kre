package mongo

import (
	"context"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"gitlab.com/konstellation/kre/runtime-api/config"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDB struct {
	cfg    *config.Config
	logger *simplelogger.SimpleLogger
	client *mongo.Client
}

func NewDB(cfg *config.Config, logger *simplelogger.SimpleLogger) *MongoDB {
	return &MongoDB{
		cfg,
		logger,
		nil,
	}
}

func (m *MongoDB) NewClient() *mongo.Client {
	client, err := mongo.NewClient(options.Client().ApplyURI(m.cfg.MongoDB.Address))
	if err != nil {
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	m.logger.Info("The MongoDB client was created")
	m.client = client

	return client
}

func (m *MongoDB) Disconnect() {
	m.logger.Info("MongoDB disconnecting...")

	if m.client == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	err := m.client.Disconnect(ctx)
	if err != nil {
		m.logger.Errorf("Error disconnecting MongoDB: %s", err)
		return
	}

	m.logger.Info("Connection to MongoDB closed.")
}
