package mongo

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"

	"gitlab.com/konstellation/kre/runtime-api/config"
	"gitlab.com/konstellation/kre/runtime-api/entity"
	"gitlab.com/konstellation/kre/runtime-api/logging"
)

type Watcher struct {
	cfg    *config.Config
	logger *logging.Logger
	client *mongo.Client
}

func NewWatcher(cfg *config.Config, logger *logging.Logger) *Watcher {
	return &Watcher{
		cfg,
		logger,
		nil,
	}
}

func (w *Watcher) Connect(ctx context.Context) {
	w.logger.Info("MongoDB connecting...")

	client, err := mongo.NewClient(options.Client().ApplyURI(w.cfg.MongoDB.Address))
	if err != nil {
		w.logger.Error(err.Error())
		os.Exit(1)
	}

	cctx, ccancel := context.WithTimeout(ctx, 20*time.Second)
	defer ccancel()

	err = client.Connect(cctx)
	if err != nil {
		w.logger.Error(err.Error())
		os.Exit(1)
	}

	// Call Ping to verify that the deployment is up and the Client was configured successfully.
	pctx, pcancel := context.WithTimeout(ctx, 20*time.Second)
	defer pcancel()

	w.logger.Info("MongoDB ping...")
	err = client.Ping(pctx, readpref.Primary())
	if err != nil {
		w.logger.Error(err.Error())
		os.Exit(1)
	}

	w.logger.Info("Watcher connected")
	w.client = client
}

func (w *Watcher) Disconnect() {
	w.logger.Info("MongoDB disconnecting...")

	if w.client == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	err := w.client.Disconnect(ctx)

	if err != nil {
		w.logger.Error(err.Error())
		os.Exit(1)
	}

	w.logger.Info("Connection to MongoDB closed.")
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
		ctx, cancel := context.WithCancel(ctx)
		w.Connect(ctx)
		defer w.Disconnect()

		collection := w.client.Database(w.cfg.MongoDB.DBName).Collection("logs")

		query := bson.D{
			{"node-id", nodeId},
		}

		queryLimit := new(int64)
		*queryLimit = QueryLimit

		queryOptions := &options.FindOptions{
			Sort:  bson.D{{"time", -1}},
			Limit: queryLimit,
		}

		w.logger.Info("-------- RUNNING INITIAL LOGS --------")
		cur, err := collection.Find(ctx, query, queryOptions)
		if err != nil {
			w.logger.Error(err.Error())
			cancel()
			return
		}

		var results []bson.M
		if err = cur.All(ctx, &results); err != nil {
			w.logger.Error(err.Error())
			cancel()
			return
		}

		operationTime := uint32(time.Now().Unix())
		if len(results) != 0 {
			queryId, ok := results[0]["_id"].(primitive.ObjectID)
			if !ok {
				w.logger.Error("MongoId to ObjectID conversion error")
				cancel()
				return
			}

			operationTime = uint32(queryId.Timestamp().Unix())
			w.logger.Info(fmt.Sprintf("-------- OPERATION TIME FROM QUERY: %s  --------", queryId.Timestamp().String()))

			count := len(results)
			for i := range results {
				result := results[count-i-1]
				logsCh <- &entity.NodeLog{
					Date:      getValueOrDefault(result, "time", ""),
					Message:   getValueOrDefault(result, "log", ""),
					Type:      getValueOrDefault(result, "type", "APP"),
					VersionId: getValueOrDefault(result, "version-name", ""),
					NodeId:    getValueOrDefault(result, "node-id", ""),
					PodId:     getValueOrDefault(result, "pod-id", ""),
					Level:     getValueOrDefault(result, "level", "INFO"),
				}
			}
		}

		opts := options.ChangeStream()
		opts.SetFullDocument(options.UpdateLookup)
		opts.SetStartAtOperationTime(&primitive.Timestamp{
			T: operationTime,
			I: 0,
		})
		stream, err := collection.Watch(ctx, pipeline, opts)
		if err != nil {
			w.logger.Error(err.Error())
			stream.Close(ctx)
			cancel()
			return
		}
		w.logger.Info("waiting for changes")

		var changeDoc bson.M
		count := 0
		for {
			ok := stream.Next(ctx)
			if !ok {
				w.logger.Info("Change Stream .Next() return false. Canceling")
				cancel()
				return
			}

			w.logger.Info(fmt.Sprintf("-------------- STREAM ELEMENT COUNT: %d", count))
			count++

			if e := stream.Decode(&changeDoc); e != nil {
				w.logger.Info(fmt.Sprintf("error decoding: %s", e))
				continue
			}

			doc, ok := changeDoc["fullDocument"].(bson.M)
			if !ok {
				w.logger.Error("Conversion error")
				cancel()
				return
			}

			logsCh <- &entity.NodeLog{
				Date:      getValueOrDefault(doc, "time", ""),
				Message:   getValueOrDefault(doc, "log", ""),
				Type:      getValueOrDefault(doc, "type", "APP"),
				VersionId: getValueOrDefault(doc, "version-name", ""),
				NodeId:    getValueOrDefault(doc, "node-id", ""),
				PodId:     getValueOrDefault(doc, "pod-id", ""),
				Level:     getValueOrDefault(doc, "level", "INFO"),
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
