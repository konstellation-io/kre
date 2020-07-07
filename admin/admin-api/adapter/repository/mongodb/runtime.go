package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
)

type RuntimeRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewRuntimeRepoMongoDB(cfg *config.Config, logger logging.Logger, client *mongo.Client) *RuntimeRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("runtimes")
	return &RuntimeRepoMongoDB{
		cfg,
		logger,
		collection,
	}
}

func (r *RuntimeRepoMongoDB) Create(ctx context.Context, runtime *entity.Runtime) (*entity.Runtime, error) {
	runtime.ID = primitive.NewObjectID().Hex()
	runtime.CreationDate = time.Now().UTC()
	runtime.Status = entity.RuntimeStatusCreating

	res, err := r.collection.InsertOne(ctx, runtime)
	if err != nil {
		return nil, err
	}

	runtime.ID = res.InsertedID.(string)
	return runtime, nil
}

func (r *RuntimeRepoMongoDB) FindAll(ctx context.Context) ([]*entity.Runtime, error) {
	var runtimes []*entity.Runtime
	cursor, err := r.collection.Find(ctx, bson.D{})
	if err != nil {
		return runtimes, err
	}

	err = cursor.All(ctx, &runtimes)
	if err != nil {
		return nil, err
	}

	return runtimes, nil
}

func (r *RuntimeRepoMongoDB) UpdateStatus(ctx context.Context, runtimeID string, newStatus entity.RuntimeStatus) error {
	filter := bson.M{"_id": runtimeID}
	upd := bson.M{
		"$set": bson.M{
			"status": newStatus.String(),
		},
	}
	result, err := r.collection.UpdateOne(ctx, filter, upd)
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrRuntimeNotFound
	}

	return nil
}

func (r *RuntimeRepoMongoDB) GetByID(ctx context.Context, runtimeID string) (*entity.Runtime, error) {
	runtime := &entity.Runtime{}
	filter := bson.D{{"_id", runtimeID}}

	err := r.collection.FindOne(ctx, filter).Decode(runtime)
	if err == mongo.ErrNoDocuments {
		return runtime, usecase.ErrRuntimeNotFound
	}

	return runtime, err
}

func (r *RuntimeRepoMongoDB) UpdatePublishedVersion(ctx context.Context, runtimeID string, versionID string) error {
	filter := bson.M{"_id": runtimeID}
	upd := bson.M{
		"$set": bson.M{
			"publishedVersion": versionID,
		},
	}
	result, err := r.collection.UpdateOne(ctx, filter, upd)
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrRuntimeNotFound
	}

	return nil
}
