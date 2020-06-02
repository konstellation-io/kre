package mongo

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"gitlab.com/konstellation/kre/runtime-api/config"
	"gitlab.com/konstellation/kre/runtime-api/entity"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

const logsCollectionName = "logs"
const logSearchPageSize = 10

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

type WatchLogsOptions struct {
	VersionID string
	Search    string
	Levels    []string
	NodeIDs   []string
}

type SearchLogsOptions struct {
	StartDate time.Time
	EndDate   time.Time
	Search    string
	Levels    []string
	NodeIDs   []string
	Cursor    string
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

	if len(searchOpts.NodeIDs) > 0 {
		filter["nodeId"] = bson.M{"$in": searchOpts.NodeIDs}
	}

	if len(searchOpts.Levels) > 0 {
		filter["level"] = bson.M{"$in": searchOpts.Levels}
	}

	if searchOpts.Cursor != "" {
		nID, err := primitive.ObjectIDFromHex(searchOpts.Cursor)
		if err != nil {
			return result, fmt.Errorf("invalid next value for paginated search: %w", err)
		}
		filter["_id"] = bson.M{"$lt": nID}
	}

	r.logger.Debugf("Logs filter = %#v", filter)

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

// TODO use the Search filter: https://jira.mongodb.org/browse/NODE-2162
// you cannot use a $text matcher on a change stream
func (r *LogRepo) WatchNodeLogs(ctx context.Context, watchLogsOptions WatchLogsOptions, logsCh chan<- *entity.NodeLog) {
	go func() {
		opts := options.ChangeStream()
		opts.SetFullDocument(options.UpdateLookup)
		opts.SetStartAtOperationTime(&primitive.Timestamp{
			T: uint32(time.Now().Unix()),
			I: 0,
		})

		conditions := bson.A{
			bson.D{{"operationType", "insert"}},
			bson.D{{"fullDocument.versionId", watchLogsOptions.VersionID}},
		}

		if len(watchLogsOptions.NodeIDs) > 0 {
			conditions = append(conditions, bson.D{{"fullDocument.nodeId", bson.M{"$in": watchLogsOptions.NodeIDs}}})
		}

		if len(watchLogsOptions.Levels) > 0 {
			conditions = append(conditions, bson.D{{"fullDocument.level", bson.M{"$in": watchLogsOptions.Levels}}})
		}

		pipeline := mongo.Pipeline{bson.D{
			{
				"$match",
				bson.M{"$and": conditions},
			},
		}}

		r.logger.Debugf("Mongo Watch Pipeline = %#v", pipeline)

		stream, err := r.collection.Watch(ctx, pipeline, opts)
		if err != nil {
			r.logger.Debugf("Closing Watch with Pipeline = %#v", pipeline)
			r.logger.Errorf("[LogRepo.WatchNodeLogs] error creating the MongoDB watcher: %s", err)
			return
		}

		for {
			ok := stream.Next(ctx)
			if !ok {
				r.logger.Debugf("Closing Watch with Pipeline = %#v", pipeline)
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

			r.logger.Debugf("Mongo Watch ChangeDoc = %#v", changeDoc)

			logsCh <- &changeDoc.FullDocument
		}
	}()
}
