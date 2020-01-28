package mongodb

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"os"
	"time"
)

type LogStreamService struct {
	cfg    *config.Config
	logger logging.Logger
	client *mongo.Client
}

func NewLogStreamService(cfg *config.Config, logger logging.Logger) *LogStreamService {
	return &LogStreamService{
		cfg,
		logger,
		nil,
	}
}

func (m *LogStreamService) Connect(ctx context.Context) {
	m.logger.Info("MongoDB connecting...")

	client, err := mongo.NewClient(options.Client().ApplyURI(m.cfg.MongoDB.Address))
	if err != nil {
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	cctx, ccancel := context.WithTimeout(ctx, 20*time.Second)
	defer ccancel()

	err = client.Connect(cctx)
	if err != nil {
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	// Call Ping to verify that the deployment is up and the Client was configured successfully.
	pctx, pcancel := context.WithTimeout(ctx, 20*time.Second)
	defer pcancel()

	m.logger.Info("MongoDB ping...")
	err = client.Ping(pctx, readpref.Primary())
	if err != nil {
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	m.logger.Info("LogStreamService connected")
	m.client = client
}

func (m *LogStreamService) Disconnect() {
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

// Node Logs
func (m *LogStreamService) WatchNodeLogs(ctx context.Context, nodeId string, logsCh chan<- *entity.NodeLog) {
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
		m.Connect(ctx)
		defer m.Disconnect()

		collection := m.client.Database(m.cfg.MongoDB.DBName).Collection("logs")

		query := bson.D{
			{"node-id", nodeId},
		}

		queryLimit := new(int64)
		*queryLimit = QueryLimit

		queryOptions := &options.FindOptions{
			Sort:  bson.D{{"time", -1}},
			Limit: queryLimit,
		}

		m.logger.Info("-------- RUNNING INITIAL LOGS --------")
		cur, err := collection.Find(ctx, query, queryOptions)
		if err != nil {
			m.logger.Error(err.Error())
			cancel()
			return
		}

		var results []bson.M
		if err = cur.All(ctx, &results); err != nil {
			m.logger.Error(err.Error())
			cancel()
			return
		}

		operationTime := uint32(time.Now().Unix())
		if len(results) != 0 {
			queryId, ok := results[0]["_id"].(primitive.ObjectID)
			if !ok {
				m.logger.Error("MongoId to ObjectID conversion error")
				cancel()
				return
			}

			operationTime = uint32(queryId.Timestamp().Unix())
			m.logger.Info(fmt.Sprintf("-------- OPERATION TIME FROM QUERY: %s  --------", queryId.Timestamp().String()))

			count := len(results)
			for i, _ := range results {
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
			m.logger.Error(err.Error())
			stream.Close(ctx)
			cancel()
			return
		}
		m.logger.Info("waiting for changes")

		var changeDoc bson.M
		count := 0
		for {
			ok := stream.Next(ctx)
			if !ok {
				m.logger.Info("Change Stream .Next() return false. Canceling")
				cancel()
				return
			}

			m.logger.Info(fmt.Sprintf("-------------- STREAM ELEMENT COUNT: %d", count))
			count++

			if e := stream.Decode(&changeDoc); e != nil {
				m.logger.Info(fmt.Sprintf("error decoding: %s", e))
				continue
			}

			doc, ok := changeDoc["fullDocument"].(bson.M)
			if !ok {
				m.logger.Error("Conversion error")
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
