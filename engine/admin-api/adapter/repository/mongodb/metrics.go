package mongodb

import (
	"context"
	"fmt"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

const metricsCollectionName = "classificationMetrics"

type MetricsMongoDBRepo struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewMetricMongoDBRepo(cfg *config.Config, logger logging.Logger, client *mongo.Client) *MetricsMongoDBRepo {
	collection := client.Database(cfg.MongoDB.DBName).Collection(metricsCollectionName)
	return &MetricsMongoDBRepo{cfg: cfg, logger: logger, collection: collection}
}

func (m *MetricsMongoDBRepo) ensureIndexes(ctx context.Context, coll *mongo.Collection) error {
	m.logger.Infof("MongoDB creating indexes for %s collection...", metricsCollectionName)
	_, err := coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{{"date", 1}, {"versionId", 1}},
		},
	})

	return err
}

func (m *MetricsMongoDBRepo) GetMetrics(ctx context.Context, startDate time.Time, endDate time.Time, versionID string) ([]entity.ClassificationMetric, error) {
	var result []entity.ClassificationMetric
	err := m.ensureIndexes(ctx, m.collection)
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

	m.logger.Debugf("Finding metrics with filter = %#v", filter)

	cur, err := m.collection.Find(ctx, filter, opts)
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

	m.logger.Infof("Found %d metrics", len(result))

	return result, nil
}
