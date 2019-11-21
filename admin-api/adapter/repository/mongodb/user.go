package mongodb

import (
	"context"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewUserRepoMongoDB(cfg *config.Config, logger logging.Logger, client *mongo.Client) *UserRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("users")
	return &UserRepoMongoDB{
		cfg,
		logger,
		collection,
	}
}

func (r *UserRepoMongoDB) Create(email string) (*entity.User, error) {
	user := &entity.User{
		ID:    primitive.NewObjectID().Hex(),
		Email: email,
	}
	res, err := r.collection.InsertOne(context.Background(), user)
	if err != nil {
		return nil, err
	}

	user.ID = res.InsertedID.(string)
	return user, nil
}

func (r *UserRepoMongoDB) GetByEmail(email string) (*entity.User, error) {
	user := &entity.User{}
	filter := bson.D{{"email", email}}

	err := r.collection.FindOne(context.Background(), filter).Decode(user)
	if err == mongo.ErrNoDocuments {
		return user, usecase.ErrUserNotFound
	}

	return user, err
}

func (r *UserRepoMongoDB) GetByID(userID string) (*entity.User, error) {
	user := &entity.User{}
	filter := bson.D{{"_id", userID}}

	err := r.collection.FindOne(context.Background(), filter).Decode(user)
	if err == mongo.ErrNoDocuments {
		return user, usecase.ErrUserNotFound
	}

	return user, err
}
