package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type RuntimeRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewRuntimeRepoMongoDB(cfg *config.Config, logger logging.Logger, client *mongo.Client) *RuntimeRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("runtimes")

	runtimeRepo := &RuntimeRepoMongoDB{
		cfg,
		logger,
		collection,
	}

	runtimeRepo.createIndexes()

	return runtimeRepo
}

func (r *RuntimeRepoMongoDB) createIndexes() {
	_, err := r.collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys: bson.M{
			"name": 1,
		},
	})
	if err != nil {
		r.logger.Errorf("error creating runtime collection indexes: %s", err)
	}
}

func (r *RuntimeRepoMongoDB) Create(ctx context.Context, runtime *entity.Runtime) (*entity.Runtime, error) {
	runtime.CreationDate = time.Now().UTC()
	_, err := r.collection.InsertOne(ctx, runtime)
	if err != nil {
		return nil, err
	}

	return runtime, nil
}

func (r *RuntimeRepoMongoDB) Get(ctx context.Context) (*entity.Runtime, error) {
	runtime := &entity.Runtime{}

	err := r.collection.FindOne(ctx, bson.M{}).Decode(runtime)
	if err == mongo.ErrNoDocuments {
		return nil, usecase.ErrRuntimeNotFound
	}

	return runtime, err
}

func (r *RuntimeRepoMongoDB) GetByID(ctx context.Context, runtimeID string) (*entity.Runtime, error) {
	runtime := &entity.Runtime{}
	filter := bson.D{{"_id", runtimeID}}

	err := r.collection.FindOne(ctx, filter).Decode(runtime)
	if err == mongo.ErrNoDocuments {
		return nil, usecase.ErrRuntimeNotFound
	}

	return runtime, err
}

func (r *RuntimeRepoMongoDB) GetByName(ctx context.Context, name string) (*entity.Runtime, error) {
	runtime := &entity.Runtime{}
	filter := bson.D{{"name", name}}

	err := r.collection.FindOne(ctx, filter).Decode(runtime)
	if err == mongo.ErrNoDocuments {
		return nil, usecase.ErrRuntimeNotFound
	}

	return runtime, err
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
