package mongodb

import (
	"context"
	"fmt"
	"time"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const metricsCollectionName = "classificationMetrics"
const databseNameSuffix = "data"

type MetricsMongoDBRepo struct {
	cfg    *config.Config
	logger logging.Logger
	client *mongo.Client
}

func NewMetricMongoDBRepo(cfg *config.Config, logger logging.Logger, client *mongo.Client) *MetricsMongoDBRepo {
	return &MetricsMongoDBRepo{cfg: cfg, logger: logger, client: client}
}

func (m *MetricsMongoDBRepo) GetMetrics(ctx context.Context, startDate, endDate time.Time,
	runtimeID, versionName string) ([]entity.ClassificationMetric, error) {
	database := m.getDatabaseName(runtimeID)
	collection := m.client.Database(database).Collection(metricsCollectionName)

	var result []entity.ClassificationMetric

	opts := &options.FindOptions{
		Sort: bson.M{"_id": 1},
	}

	filter := bson.M{
		"date": bson.M{
			"$gte": startDate.Format(time.RFC3339),
			"$lte": endDate.Format(time.RFC3339),
		},
		"versionName": versionName,
	}

	m.logger.Debugf("Finding metrics with filter = %#v", filter)

	cur, err := collection.Find(ctx, filter, opts)
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

func (m *MetricsMongoDBRepo) CreateIndexes(ctx context.Context, runtimeID string) error {
	database := m.getDatabaseName(runtimeID)
	collection := m.client.Database(database).Collection(metricsCollectionName)
	m.logger.Infof("MongoDB creating indexes for %s collection...", metricsCollectionName)

	_, err := collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.M{"date": 1, "versionName": 1},
		},
	})
	if err != nil {
		return err
	}

	return nil
}

func (m *MetricsMongoDBRepo) getDatabaseName(runtimeID string) string {
	return fmt.Sprintf("%s-%s", runtimeID, databseNameSuffix)
}
