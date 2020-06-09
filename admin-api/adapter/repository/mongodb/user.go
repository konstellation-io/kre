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

func (r *UserRepoMongoDB) Create(ctx context.Context, email string, accessLevel entity.AccessLevel) (*entity.User, error) {
	user := &entity.User{
		ID:           primitive.NewObjectID().Hex(),
		CreationDate: time.Now(),
		Email:        email,
		AccessLevel:  accessLevel,
	}
	res, err := r.collection.InsertOne(ctx, user)
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

func (r *UserRepoMongoDB) GetByIDs(keys []string) ([]*entity.User, error) {
	ctx, _ := context.WithTimeout(context.Background(), 60*time.Second)
	var users []*entity.User
	cur, err := r.collection.Find(ctx, bson.M{"_id": bson.M{"$in": keys}})
	if err != nil {
		return users, err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var user entity.User
		err = cur.Decode(&user)
		if err != nil {
			return users, err
		}
		users = append(users, &user)
	}

	return users, nil
}

func (r *UserRepoMongoDB) GetAll() ([]*entity.User, error) {
	ctx, _ := context.WithTimeout(context.Background(), 60*time.Second)
	var users []*entity.User
	cur, err := r.collection.Find(ctx, bson.D{})
	if err != nil {
		return users, err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var user entity.User
		err = cur.Decode(&user)
		if err != nil {
			return users, err
		}
		users = append(users, &user)
	}

	return users, nil
}

func (r *UserRepoMongoDB) UpdateAccessLevel(ctx context.Context, userIDs []string, accessLevel entity.AccessLevel) ([]*entity.User, error) {
	filter := bson.M{
		"_id": bson.M{
			"$in": userIDs,
		},
	}

	upd := bson.M{
		"$set": bson.M{
			"accessLevel": accessLevel.String(),
		},
	}

	_, err := r.collection.UpdateMany(ctx, filter, upd)
	if err != nil {
		return nil, err
	}

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	var updatedUsers []*entity.User
	err = cursor.All(ctx, &updatedUsers)
	if err != nil {
		return nil, err
	}

	return updatedUsers, nil
}
