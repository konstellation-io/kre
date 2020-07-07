package mongodb

import (
	"context"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
)

type MongoDB struct {
	cfg    *config.Config
	logger logging.Logger
	client *mongo.Client
}

func NewMongoDB(cfg *config.Config, logger logging.Logger) *MongoDB {
	return &MongoDB{
		cfg,
		logger,
		nil,
	}
}

func (m *MongoDB) Connect() *mongo.Client {
	m.logger.Info("MongoDB connecting...")

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

	// Call Ping to verify that the deployment is up and the Client was configured successfully.
	ctx, cancel = context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	m.logger.Info("MongoDB ping...")
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	m.logger.Info("MongoDB connected")
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
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	m.logger.Info("Connection to MongoDB closed.")

}
