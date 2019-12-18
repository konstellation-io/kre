package mongodb

import (
	"context"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
)

type VersionRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewVersionRepoMongoDB(
	cfg *config.Config,
	logger logging.Logger,
	client *mongo.Client,
) *VersionRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("versions")
	return &VersionRepoMongoDB{
		cfg,
		logger,
		collection,
	}
}

func (r *VersionRepoMongoDB) Create(userID, runtimeID, name, description string) (*entity.Version, error) {
	version := &entity.Version{
		ID:             primitive.NewObjectID().Hex(),
		RuntimeID:      runtimeID,
		Name:           name,
		Description:    description,
		CreationDate:   time.Now().UTC(),
		CreationAuthor: userID,
		Status:         string(usecase.VersionStatusCreated),
	}
	res, err := r.collection.InsertOne(context.Background(), version)
	if err != nil {
		return nil, err
	}

	version.ID = res.InsertedID.(string)
	return version, nil
}
