package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/konstellation-io/kre/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
)

type SettingRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewSettingRepoMongoDB(cfg *config.Config,
	logger logging.Logger,
	client *mongo.Client,
) *SettingRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("settings")
	return &SettingRepoMongoDB{
		cfg:        cfg,
		logger:     logger,
		collection: collection,
	}
}

func (r *SettingRepoMongoDB) Get() (*entity.Setting, error) {
	setting := &entity.Setting{}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	err := r.collection.FindOne(ctx, bson.D{}).Decode(&setting)
	if err == mongo.ErrNoDocuments {
		return setting, usecase.ErrSettingNotFound
	}

	return setting, nil
}

func (r *SettingRepoMongoDB) Create(setting entity.Setting) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, setting)
	if err != nil {
		return err
	}

	return nil
}

func (r *SettingRepoMongoDB) Update(setting *entity.Setting) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_, err := r.collection.ReplaceOne(ctx, bson.D{}, setting)
	if err != nil {
		return err
	}

	return nil
}
