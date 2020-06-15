package mongo

import (
	"context"
	"fmt"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/konstellation-io/kre/runtime-api/config"
	"github.com/konstellation-io/kre/runtime-api/entity"
)

const metricsCollectionName = "classificationMetrics"

type MetricsRepo struct {
	cfg        *config.Config
	logger     *simplelogger.SimpleLogger
	collection *mongo.Collection
}

func NewMetricsRepo(cfg *config.Config, logger *simplelogger.SimpleLogger, client *mongo.Client) *MetricsRepo {
	collection := client.Database(cfg.MongoDB.DBName).Collection(metricsCollectionName)
	return &MetricsRepo{
		cfg,
		logger,
		collection,
	}
}

func (r *MetricsRepo) ensureIndexes(ctx context.Context, coll *mongo.Collection) error {
	r.logger.Info("MongoDB creating indexes...")
	_, err := coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{{"date", 1}, {"versionId", 1}},
		},
	})

	return err
}

func (r *MetricsRepo) GetMetrics(
	ctx context.Context,
	startDate time.Time,
	endDate time.Time,
	versionID string,
) ([]entity.ClassificationMetric, error) {
	var result []entity.ClassificationMetric
	err := r.ensureIndexes(ctx, r.collection)
	if err != nil {
		return result, err
	}

	opts := &options.FindOptions{
		Sort: bson.D{{"_id", 1}},
	}

	filter := bson.M{
		"date": bson.M{
			"$gte": startDate.Format(time.RFC3339),
			"$lte": endDate.Format(time.RFC3339),
		},
		"versionId": versionID,
	}

	r.logger.Debugf("Finding metrics with filter = %#v", filter)

	cur, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return result, err
	}

	if err = cur.All(ctx, &result); err != nil {
		return nil, fmt.Errorf("error iterating db cursor: %w", err)
	}

	// Err returns the last error seen by the Cursor, or nil if no error has occurred.
	if err := cur.Err(); err != nil {
		return result, fmt.Errorf("there was error in the GetMetrics cursor: %w", err)
	}

	r.logger.Infof("Found %d metrics", len(result))

	return result, nil
}
