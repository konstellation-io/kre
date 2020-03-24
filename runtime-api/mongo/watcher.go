package mongo

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"

	"gitlab.com/konstellation/kre/runtime-api/config"
	"gitlab.com/konstellation/kre/runtime-api/entity"
)

type Watcher struct {
	cfg    *config.Config
	logger *simplelogger.SimpleLogger
}

func NewWatcher(cfg *config.Config, logger *simplelogger.SimpleLogger) *Watcher {
	return &Watcher{
		cfg,
		logger,
	}
}

func (w *Watcher) newMongoClientConnected(ctx context.Context) (*mongo.Client, error) {
	w.logger.Info("MongoDB connecting...")

	client, err := mongo.NewClient(options.Client().ApplyURI(w.cfg.MongoDB.Address))
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
	w.logger.Info("MongoDB ping...")
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return nil, err
	}

	w.logger.Info("MongoDB connected")
	return client, nil
}

func (w *Watcher) disconnectMongoClient(client *mongo.Client) error {
	w.logger.Info("MongoDB disconnecting...")

	if client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	err := client.Disconnect(ctx)
	if err != nil {
		return err
	}

	w.logger.Info("Connection to MongoDB closed.")
	return nil
}

func (w *Watcher) NodeLogs(ctx context.Context, nodeId string, logsCh chan<- *entity.NodeLog) {
	const QueryLimit = 10

	pipeline := mongo.Pipeline{
		bson.D{
			{"$match", bson.D{
				{"$and", bson.A{
					bson.D{{"fullDocument.node-id", nodeId}},
					bson.D{{"operationType", "insert"}}, // Only show insert actions
				},
				},
			},
			},
		},
	}

	go func() {
		client, err := w.newMongoClientConnected(ctx)
		if err != nil {
			w.logger.Errorf("Unexpected error connecting to mongodb: %v", err)
			return
		}

		defer func() {
			err := w.disconnectMongoClient(client)
			if err != nil {
				w.logger.Errorf("Unexpected error disconnecting mongodb: %v", err)
			}
		}()

		collection := client.Database(w.cfg.MongoDB.DBName).Collection("logs")

		query := bson.D{
			{"node-id", nodeId},
		}

		queryLimit := new(int64)
		*queryLimit = QueryLimit

		queryOptions := &options.FindOptions{
			Sort:  bson.D{{"_id", -1}},
			Limit: queryLimit,
		}

		w.logger.Infof("Getting last %d logs...\n", QueryLimit)
		cur, err := collection.Find(ctx, query, queryOptions)
		if err != nil {
			w.logger.Error(err.Error())
			return
		}

		var results []bson.M
		if err = cur.All(ctx, &results); err != nil {
			w.logger.Error(err.Error())
			return
		}

		if len(results) > 0 {
			count := len(results) - 1
			for i := range results {
				result := results[count-i]
				logsCh <- &entity.NodeLog{
					Date:        getValueOrDefault(result, "time", ""),
					VersionName: getValueOrDefault(result, "versionName", ""),
					NodeID:      getValueOrDefault(result, "nodeId", ""),
					PodID:       getValueOrDefault(result, "podId", ""),
					Message:     getValueOrDefault(result, "message", ""),
					Level:       getValueOrDefault(result, "level", "INFO"),
					WorkflowID:  getValueOrDefault(result, "workflowId", ""),
				}
			}
		}

		opts := options.ChangeStream()
		opts.SetFullDocument(options.UpdateLookup)
		opts.SetStartAtOperationTime(&primitive.Timestamp{
			T: uint32(time.Now().Unix()),
			I: 0,
		})
		stream, err := collection.Watch(ctx, pipeline, opts)
		if err != nil {
			w.logger.Error(err.Error())

			err := stream.Close(ctx)
			if err != nil {
				w.logger.Errorf("Unexpected error closing stream: %v", err)
			}

			return
		}
		w.logger.Info("waiting for changes")

		var changeDoc bson.M
		for {
			ok := stream.Next(ctx)
			if !ok {
				w.logger.Infof("Change Stream .Next() return false")
				return
			}

			if e := stream.Decode(&changeDoc); e != nil {
				w.logger.Warn(fmt.Sprintf("error decoding: %s", e))
				continue
			}

			doc, ok := changeDoc["fullDocument"].(bson.M)
			if !ok {
				w.logger.Warnf("Conversion error: %v", changeDoc)
				continue
			}

			logsCh <- &entity.NodeLog{
				Date:        getValueOrDefault(doc, "time", ""),
				Message:     getValueOrDefault(doc, "message", ""),
				VersionName: getValueOrDefault(doc, "versionName", ""),
				NodeID:      getValueOrDefault(doc, "nodeId", ""),
				PodID:       getValueOrDefault(doc, "podId", ""),
				Level:       getValueOrDefault(doc, "level", "INFO"),
				WorkflowID:  getValueOrDefault(doc, "workflowId", ""),
			}
		}
	}()

}

func getValueOrDefault(doc bson.M, key, defVal string) string {
	if v, ok := doc[key]; ok {
		return v.(string)
	}
	return defVal
}
