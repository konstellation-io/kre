package mongodb

import (
	"context"
	"gitlab.com/konstellation/konstellation-ce/kre/mongo-writer/config"
	"gitlab.com/konstellation/konstellation-ce/kre/mongo-writer/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"os"
	"time"
)

type MongoDB struct {
	cfg          *config.Config
	logger       *logging.Logger
	client       *mongo.Client
	TotalInserts int
}

type InsertsMap map[string][]bson.M

func NewMongoDB(cfg *config.Config, logger *logging.Logger) *MongoDB {
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

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	return m.client.Disconnect(ctx)
}

func (m *MongoDB) KeepAlive(waitc chan<- struct{}) {
	go func() {
		for {
			time.Sleep(5 * time.Second)
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			m.logger.Info("Mongo keep alive...")
			err := m.client.Ping(ctx, readpref.Primary())
			if err != nil {
				cancel()
				m.logger.Error(err.Error())
				waitc <- struct{}{}
				return
			}
			cancel()
		}
	}()
}

func (m *MongoDB) InsertMessages(inserts *InsertsMap) error {
	db := m.client.Database(m.cfg.MongoDB.DBName)
	ctx := context.TODO()

	for colName, list := range *inserts {
		col := db.Collection(colName)

		var writes []mongo.WriteModel

		for _, d := range list {
			writes = append(writes, mongo.NewInsertOneModel().SetDocument(d))
		}

		// run bulk write
		_, err := col.BulkWrite(ctx, writes)
		if err != nil {
			return err
		}

		m.TotalInserts += len(writes)

	}

	return nil
}
