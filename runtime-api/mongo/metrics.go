package mongo

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"gitlab.com/konstellation/kre/runtime-api/config"
	"gitlab.com/konstellation/kre/runtime-api/entity"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

const metricsCollectionName = "classificationMetrics"

type MetricsRepo struct {
	cfg    *config.Config
	logger *simplelogger.SimpleLogger
}

func NewMetricsRepo(cfg *config.Config, logger *simplelogger.SimpleLogger) *MetricsRepo {
	return &MetricsRepo{
		cfg:    cfg,
		logger: logger,
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

	client, err := newMongoClient(ctx, r.cfg, r.logger)
	if err != nil {
		return result, err
	}

	defer func() {
		err = disconnectMongoClient(ctx, r.logger, client)
		if err != nil {
			r.logger.Errorf("error disconnecting from MongoDB: %s", err)
		}
	}()

	collection := client.Database(r.cfg.MongoDB.DBName).Collection(metricsCollectionName)
	err = r.ensureIndexes(ctx, collection)
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

	cur, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return result, err
	}

	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var m entity.ClassificationMetric
		err := cur.Decode(&m)
		if err != nil {
			r.logger.Errorf("error decoding ClassificationMetric document from mongodb: %s", err)
		} else {
			result = append(result, m)
		}
	}

	// Err returns the last error seen by the Cursor, or nil if no error has occurred.
	if err := cur.Err(); err != nil {
		return result, fmt.Errorf("there was error in the GetMetrics cursor: %w", err)
	}

	r.logger.Infof("Found %d metrics", len(result))

	return result, nil
}
