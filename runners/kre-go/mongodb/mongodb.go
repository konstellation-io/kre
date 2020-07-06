package mongodb

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/${GOFILE} -package=mocks

import (
	"context"
	"os"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"go.mongodb.org/mongo-driver/bson"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/konstellation-io/kre/runners/kre-go/config"
)

type MongoDB struct {
	cfg    config.Config
	logger *simplelogger.SimpleLogger
	client *mongo.Client
}

type Manager interface {
	Connect() error
	Disconnect() error
	Find(context.Context, string, bson.M, interface{}) error
}

func NewMongoManager(cfg config.Config, logger *simplelogger.SimpleLogger) *MongoDB {
	return &MongoDB{
		cfg,
		logger,
		nil,
	}
}

func (m *MongoDB) Connect() error {
	m.logger.Info("MongoDB connecting...")

	client, err := mongo.NewClient(options.Client().ApplyURI(m.cfg.MongoDB.Address))
	if err != nil {
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(m.cfg.MongoDB.ConnTimeout)*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	// Call Ping to verify that the deployment is up and the Client was configured successfully.
	ctx, cancel = context.WithTimeout(context.Background(), time.Duration(m.cfg.MongoDB.ConnTimeout)*time.Second)
	defer cancel()

	m.logger.Info("MongoDB ping...")
	err = client.Ping(ctx, nil)
	if err != nil {
		return err
	}

	m.logger.Info("MongoDB connected")
	m.client = client

	return nil
}

func (m *MongoDB) Disconnect() error {
	m.logger.Info("MongoDB disconnecting...")

	if m.client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(m.cfg.MongoDB.ConnTimeout)*time.Second)
	defer cancel()

	return m.client.Disconnect(ctx)
}

func (m *MongoDB) Find(ctx context.Context, colName string, filter bson.M, results interface{}) error {
	cursor, err := m.client.
		Database(m.cfg.MongoDB.DBName).
		Collection(colName).
		Find(ctx, filter)
	if err != nil {
		return err
	}

	err = cursor.All(ctx, results)
	if err != nil {
		return err
	}

	return nil
}
