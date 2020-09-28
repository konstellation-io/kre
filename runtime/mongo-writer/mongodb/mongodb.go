package mongodb

import (
	"context"
	"os"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/konstellation-io/kre/runtime/mongo-writer/config"
)

type MongoDB struct {
	cfg          *config.Config
	logger       *simplelogger.SimpleLogger
	client       *mongo.Client
	TotalInserts int64
}

type InsertsMap map[string][]bson.M

func NewMongoManager(cfg *config.Config, logger *simplelogger.SimpleLogger) *MongoDB {
	return &MongoDB{
		cfg,
		logger,
		nil,
		0,
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

func (m *MongoDB) InsertMessages(ctx context.Context, dbName string, inserts *InsertsMap) error {
	db := m.client.Database(dbName)

	for colName, list := range *inserts {
		col := db.Collection(colName)

		writes := make([]mongo.WriteModel, len(list))

		for i, d := range list {
			writes[i] = mongo.NewInsertOneModel().SetDocument(d)
		}

		r, err := col.BulkWrite(ctx, writes)
		if err != nil {
			return err
		}

		m.TotalInserts += r.InsertedCount
	}

	return nil
}

func (m *MongoDB) InsertOne(ctx context.Context, dbName, coll string, doc interface{}) error {
	db := m.client.Database(dbName)

	_, err := db.Collection(coll).InsertOne(ctx, doc)
	if err != nil {
		return err
	}

	m.TotalInserts++

	return nil
}
