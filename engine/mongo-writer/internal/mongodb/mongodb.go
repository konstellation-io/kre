package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/konstellation-io/kre/engine/mongo-writer/internal/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/logging"
)

type MongoDB struct {
	cfg          *config.Config
	logger       logging.Logger
	client       *mongo.Client
	TotalInserts int64
}

func NewMongoManager(cfg *config.Config, logger logging.Logger) *MongoDB {
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
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(m.cfg.MongoDB.ConnTimeout)*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		return err
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

func (m *MongoDB) InsertMessages(ctx context.Context, dbName, collName string, inserts interface{}) error {
	db := m.client.Database(dbName)
	col := db.Collection(collName)

	list := inserts.([]interface{})
	writes := make([]mongo.WriteModel, len(list))

	for idx, doc := range list {
		writes[idx] = mongo.NewInsertOneModel().SetDocument(doc)
	}

	r, err := col.BulkWrite(ctx, writes)
	if err != nil {
		return err
	}

	m.TotalInserts += r.InsertedCount

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
