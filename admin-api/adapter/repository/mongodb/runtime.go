package mongodb

import (
	"context"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
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

func (r *RuntimeRepoMongoDB) Create(name string, userID string) (*entity.Runtime, error) {
	runtime := &entity.Runtime{
		ID:           primitive.NewObjectID().Hex(),
		Name:         name,
		CreationDate: time.Now().UTC(),
		Owner:        userID,
	}
	res, err := r.collection.InsertOne(context.Background(), runtime)
	if err != nil {
		return nil, err
	}

	runtime.ID = res.InsertedID.(string)
	return runtime, nil
}
