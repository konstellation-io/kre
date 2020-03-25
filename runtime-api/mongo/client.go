package mongo

import (
	"context"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"gitlab.com/konstellation/kre/runtime-api/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"time"
)

func newMongoClient(
	ctx context.Context,
	cfg *config.Config,
	logger *simplelogger.SimpleLogger,
) (*mongo.Client, error) {
	logger.Info("MongoDB connecting...")

	client, err := mongo.NewClient(options.Client().ApplyURI(cfg.MongoDB.Address))
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		return nil, err
	}

	// Call Ping to verify that the deployment is up and the Client was configured successfully.
	logger.Info("MongoDB ping...")
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return nil, err
	}

	logger.Info("MongoDB connected")
	return client, nil
}

func disconnectMongoClient(
	ctx context.Context,
	logger *simplelogger.SimpleLogger,
	client *mongo.Client,
) error {
	logger.Info("MongoDB disconnecting...")

	if client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()

	err := client.Disconnect(ctx)
	if err != nil {
		return err
	}

	logger.Info("MongoDB connection closed")
	return nil
}
