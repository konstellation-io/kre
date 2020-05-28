package mongo

import (
	"context"
	"fmt"
	"time"

	"gitlab.com/konstellation/kre/libs/simplelogger"
	"gitlab.com/konstellation/kre/runtime-api/config"
	"gitlab.com/konstellation/kre/runtime-api/entity"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const logsCollectionName = "logs"
const logSearchPageSize = 40

type LogRepo struct {
	cfg        *config.Config
	logger     *simplelogger.SimpleLogger
	collection *mongo.Collection
}

func NewLogRepo(cfg *config.Config, logger *simplelogger.SimpleLogger, client *mongo.Client) *LogRepo {
	collection := client.Database(cfg.MongoDB.DBName).Collection(logsCollectionName)
	return &LogRepo{
		cfg,
		logger,
		collection,
	}
}

type SearchLogsOptions struct {
	StartDate  time.Time
	EndDate    time.Time
	WorkflowID string
	Search     string
	NodeID     string
	Level      string
	Cursor     string
}

type SearchLogsResult struct {
	Cursor string
	Logs   []*entity.NodeLog
}

func (r *LogRepo) ensureIndexes(ctx context.Context, coll *mongo.Collection) error {
	r.logger.Info("MongoDB creating indexes...")
	_, err := coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{{"message", "text"}},
		},
		{
			Keys: bson.D{{"date", 1}},
		},
	})

	return err
}

func (r *LogRepo) PaginatedSearch(
	ctx context.Context,
	searchOpts SearchLogsOptions,
) (SearchLogsResult, error) {
	result := SearchLogsResult{}

	err := r.ensureIndexes(ctx, r.collection)
	if err != nil {
		return result, err
	}

	pageSize := new(int64)
	*pageSize = logSearchPageSize
	opts := &options.FindOptions{
		Limit: pageSize,
		Sort:  bson.D{{"_id", -1}},
	}

	filter := bson.M{
		"date": bson.M{
			"$gte": searchOpts.StartDate.Format(time.RFC3339),
			"$lte": searchOpts.EndDate.Format(time.RFC3339),
		},
	}

	if searchOpts.Search != "" {
		// https://docs.mongodb.com/manual/text-search/
		filter["$text"] = bson.M{"$search": searchOpts.Search}
	}

	if searchOpts.WorkflowID != "" {
		filter["workflowId"] = searchOpts.WorkflowID
	}

	if searchOpts.NodeID != "" {
		filter["nodeId"] = searchOpts.NodeID
	}

	if searchOpts.Level != "" {
		filter["level"] = searchOpts.Level
	}

	if searchOpts.Cursor != "" {
		nID, err := primitive.ObjectIDFromHex(searchOpts.Cursor)
		if err != nil {
			return result, fmt.Errorf("invalid next value for paginated search: %w", err)
		}
		filter["_id"] = bson.M{"$lt": nID}
	}

	cur, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return result, err
	}

	var logs []*entity.NodeLog
	if err := cur.All(ctx, &logs); err != nil {
		return result, err
	}

	result.Logs = logs

	if len(logs) == logSearchPageSize {
		result.Cursor = logs[logSearchPageSize-1].ID
	}

	r.logger.Infof("Found %d logs", len(logs))

	return result, nil
}

func (r *LogRepo) WatchNodeLogs(ctx context.Context, nodeId string, logsCh chan<- *entity.NodeLog) {
	go func() {
		opts := options.ChangeStream()
		opts.SetFullDocument(options.UpdateLookup)
		opts.SetStartAtOperationTime(&primitive.Timestamp{
			T: uint32(time.Now().Unix()),
			I: 0,
		})

		pipeline := mongo.Pipeline{
			bson.D{
				{
					"$match",
					bson.D{
						{
							"$and",
							bson.A{
								bson.D{{"fullDocument.nodeId", nodeId}},
								bson.D{{"operationType", "insert"}}, // Only show insert actions
							},
						},
					},
				},
			},
		}

		stream, err := r.collection.Watch(ctx, pipeline, opts)
		if err != nil {
			r.logger.Errorf("[LogRepo.WatchNodeLogs] error creating the MongoDB watcher: %s", err)
			return
		}

		for {
			ok := stream.Next(ctx)
			if !ok {
				r.logger.Infof("[LogRepo.WatchNodeLogs] stream.Next() returns false")
				return
			}

			changeDoc := struct {
				FullDocument entity.NodeLog `bson:"fullDocument"`
			}{}

			if e := stream.Decode(&changeDoc); e != nil {
				r.logger.Warnf("[LogRepo.WatchNodeLogs] error decoding changeDoc: %s", e)
				continue
			}

			logsCh <- &changeDoc.FullDocument
		}
	}()
}
