package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"gitlab.com/konstellation/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
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

func (r *RuntimeRepoMongoDB) Create(runtime *entity.Runtime) (*entity.Runtime, error) {

	runtime.ID = primitive.NewObjectID().Hex()
	runtime.CreationDate = time.Now().UTC()
	runtime.Status = string(usecase.RuntimeStatusCreating)

	res, err := r.collection.InsertOne(context.Background(), runtime)
	if err != nil {
		return nil, err
	}

	runtime.ID = res.InsertedID.(string)
	return runtime, nil
}

func (r *RuntimeRepoMongoDB) FindAll() ([]*entity.Runtime, error) {
	ctx, _ := context.WithTimeout(context.Background(), 60*time.Second)
	var runtimes []*entity.Runtime
	cur, err := r.collection.Find(ctx, bson.D{})
	if err != nil {
		return runtimes, err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var runtime entity.Runtime
		err = cur.Decode(&runtime)
		if err != nil {
			return runtimes, err
		}
		runtimes = append(runtimes, &runtime)
	}

	return runtimes, nil
}

func (r *RuntimeRepoMongoDB) Update(runtime *entity.Runtime) error {
	_, err := r.collection.ReplaceOne(context.Background(), bson.M{"_id": runtime.ID}, runtime)
	if err != nil {
		return err
	}

	return nil
}

func (r *RuntimeRepoMongoDB) GetByID(runtimeID string) (*entity.Runtime, error) {
	runtime := &entity.Runtime{}
	filter := bson.D{{"_id", runtimeID}}

	err := r.collection.FindOne(context.Background(), filter).Decode(runtime)
	if err == mongo.ErrNoDocuments {
		return runtime, usecase.ErrRuntimeNotFound
	}

	return runtime, err
}
