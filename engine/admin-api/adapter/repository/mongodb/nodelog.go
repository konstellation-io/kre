package mongodb

import (
	"context"
	"fmt"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

const logsCollectionName = "logs"
const logSearchPageSize = 40

type NodeLogMongoDBRepo struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewNodeLogMongoDBRepo(cfg *config.Config, logger logging.Logger, client *mongo.Client) *NodeLogMongoDBRepo {
	collection := client.Database(cfg.MongoDB.DBName).Collection(logsCollectionName)
	return &NodeLogMongoDBRepo{cfg: cfg, logger: logger, collection: collection}
}

func (n *NodeLogMongoDBRepo) ensureIndexes(ctx context.Context, coll *mongo.Collection) error {
	n.logger.Infof("MongoDB creating indexes for %s collection...", logsCollectionName)
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

// TODO use the Search filter: https://jira.mongodb.org/browse/NODE-2162
// you cannot use a $text matcher on a change stream
func (n *NodeLogMongoDBRepo) WatchNodeLogs(ctx context.Context, versionID string, filters entity.LogFilters) (<-chan *entity.NodeLog, error) {
	logsCh := make(chan *entity.NodeLog, 1)

	go func() {
		defer close(logsCh)

		opts := options.ChangeStream()
		opts.SetFullDocument(options.UpdateLookup)
		opts.SetStartAtOperationTime(&primitive.Timestamp{
			T: uint32(time.Now().Unix()),
			I: 0,
		})

		conditions := bson.A{
			bson.D{{"operationType", "insert"}},
			bson.D{{"fullDocument.versionId", versionID}},
		}

		if len(filters.NodeIDs) > 0 {
			conditions = append(conditions, bson.D{{"fullDocument.nodeId", bson.M{"$in": filters.NodeIDs}}})
		}

		if len(filters.Levels) > 0 {
			conditions = append(conditions, bson.D{{"fullDocument.level", bson.M{"$in": filters.Levels}}})
		}

		pipeline := mongo.Pipeline{bson.D{
			{
				"$match",
				bson.M{"$and": conditions},
			},
		}}

		n.logger.Debugf("Creating a mongodb watcher for logs")

		stream, err := n.collection.Watch(ctx, pipeline, opts)
		if err != nil {
			n.logger.Errorf("Error creating the MongoDB watcher for logs: %w", err)
			return
		}

		for {
			ok := stream.Next(ctx)
			if !ok {
				n.logger.Infof("[LogRepo.WatchNodeLogs] Watcher closed, stream.Next() is false: %s", stream.Err())
				return
			}

			changeDoc := struct {
				FullDocument entity.NodeLog `bson:"fullDocument"`
			}{}

			if e := stream.Decode(&changeDoc); e != nil {
				n.logger.Warnf("[LogRepo.WatchNodeLogs] error decoding changeDoc: %s", e)
				continue
			}

			n.logger.Debugf("Received a new log with ID = %s", changeDoc.FullDocument.ID)

			logsCh <- &changeDoc.FullDocument
		}
	}()

	return logsCh, nil
}

func (n *NodeLogMongoDBRepo) PaginatedSearch(ctx context.Context, searchOpts *entity.SearchLogsOptions) (*entity.SearchLogsResult, error) {
	result := entity.SearchLogsResult{}

	err := n.ensureIndexes(ctx, n.collection)
	if err != nil {
		return &result, err
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

	if searchOpts.Search != nil {
		// https://docs.mongodb.com/manual/text-search/
		filter["$text"] = bson.M{"$search": *searchOpts.Search}
	}

	if len(searchOpts.NodeIDs) > 0 {
		filter["nodeId"] = bson.M{"$in": searchOpts.NodeIDs}
	}

	if len(searchOpts.Levels) > 0 {
		filter["level"] = bson.M{"$in": searchOpts.Levels}
	}

	if searchOpts.Cursor != nil {
		nID, err := primitive.ObjectIDFromHex(*searchOpts.Cursor)
		if err != nil {
			return &result, fmt.Errorf("invalid next value for paginated search: %w", err)
		}
		filter["_id"] = bson.M{"$lt": nID}
	}

	n.logger.Debugf("Logs filter = %#v", filter)

	cur, err := n.collection.Find(ctx, filter, opts)
	if err != nil {
		return &result, err
	}

	var logs []*entity.NodeLog
	if err := cur.All(ctx, &logs); err != nil {
		return &result, err
	}

	result.Logs = logs

	if len(logs) == logSearchPageSize {
		result.Cursor = logs[logSearchPageSize-1].ID
	}

	n.logger.Infof("Found %d logs", len(logs))

	return &result, nil
}
