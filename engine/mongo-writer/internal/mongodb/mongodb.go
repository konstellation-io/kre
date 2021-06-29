package mongodb

import (
	"context"
	"errors"
	"reflect"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/konstellation-io/kre/engine/mongo-writer/internal/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/logging"
)

var (
	ErrDocsInvalidType = errors.New("docs must be a slice of documents")
)

type MongoDB struct {
	cfg          *config.Config
	logger       logging.Logger
	client       *mongo.Client
	totalInserts int64
}

func NewMongoManager(cfg *config.Config, logger logging.Logger) MongoManager {
	return &MongoDB{
		cfg,
		logger,
		nil,
		0,
	}
}

func (m *MongoDB) Connect() error {
	m.logger.Info("MongoDB connecting...")

	timeout := time.Duration(m.cfg.MongoDB.ConnTimeout) * time.Second

	client, err := mongo.NewClient(options.Client().ApplyURI(m.cfg.MongoDB.Address))
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		return err
	}

	// Call Ping to verify that the deployment is up and the Client was configured successfully.
	ctx, cancel = context.WithTimeout(context.Background(), timeout)
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

func (m *MongoDB) InsertOne(ctx context.Context, db, coll string, doc interface{}) error {
	_, err := m.client.Database(db).Collection(coll).InsertOne(ctx, doc)
	if err != nil {
		return err
	}

	m.totalInserts++

	return nil
}

func (m *MongoDB) InsertMany(ctx context.Context, db, coll string, docs interface{}) error {
	docsValue := reflect.ValueOf(docs)
	if docsValue.Kind() != reflect.Slice {
		return ErrDocsInvalidType
	}

	writes := make([]mongo.WriteModel, docsValue.Len())

	for i := 0; i < docsValue.Len(); i++ {
		writes[i] = mongo.NewInsertOneModel().SetDocument(docsValue.Index(i).Interface())
	}

	r, err := m.client.Database(db).Collection(coll).BulkWrite(ctx, writes)
	if err != nil {
		return err
	}

	m.totalInserts += r.InsertedCount

	return nil
}

func (m *MongoDB) TotalInserts() int64 {
	return m.totalInserts
}
