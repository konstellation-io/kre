package mongodb

import (
	"context"
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
	return &RuntimeRepoMongoDB{
		cfg,
		logger,
		collection,
	}
}

func (r *RuntimeRepoMongoDB) Create(ctx context.Context, runtime *entity.Runtime) (*entity.Runtime, error) {
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
