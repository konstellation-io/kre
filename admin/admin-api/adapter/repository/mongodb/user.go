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

type UserRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewUserRepoMongoDB(cfg *config.Config, logger logging.Logger, client *mongo.Client) *UserRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("users")
	users := &UserRepoMongoDB{
		cfg,
		logger,
		collection,
	}

	users.createIndexes()

	return users
}

func (r *UserRepoMongoDB) createIndexes() {
	indexes := []mongo.IndexModel{
		{
			Keys: bson.M{
				"email": "text",
			},
		},
		{
			Keys: bson.M{
				"email": 1,
			},
		},
	}

	_, err := r.collection.Indexes().CreateMany(context.Background(), indexes)
	if err != nil {
		r.logger.Errorf("error creating user indexes: %s", err)
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
	filter := bson.M{"email": email, "deleted": false}

	err := r.collection.FindOne(context.Background(), filter).Decode(user)
	if err == mongo.ErrNoDocuments {
		return user, usecase.ErrUserNotFound
	}

	return user, err
}

func (r *UserRepoMongoDB) GetManyByEmail(ctx context.Context, email string) ([]*entity.User, error) {
	filter := bson.M{
		"$text": bson.M{
			"$search": email,
		},
		"deleted": false,
	}

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	var users []*entity.User
	err = cursor.All(ctx, &users)
	if err != nil {
		return nil, err
	}

	return users, nil
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
	cursor, err := r.collection.Find(ctx, bson.M{"_id": bson.M{"$in": keys}})
	if err != nil {
		return nil, err
	}

	var users []*entity.User
	err = cursor.All(ctx, &users)
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (r *UserRepoMongoDB) GetAll(ctx context.Context, returnDeleted bool) ([]*entity.User, error) {
	filter := bson.M{}
	if !returnDeleted {
		filter["deleted"] = false
	}

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	var users []*entity.User
	err = cursor.All(ctx, &users)
	if err != nil {
		return nil, err
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

func (r *UserRepoMongoDB) MarkAsDeleted(ctx context.Context, userIDs []string) ([]*entity.User, error) {
	filter := bson.M{
		"_id": bson.M{
			"$in": userIDs,
		},
	}

	upd := bson.M{
		"$set": bson.M{
			"deleted": true,
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

func (r *UserRepoMongoDB) UpdateLastActivity(userID string) error {
	filter := bson.M{
		"_id": userID,
	}

	upd := bson.M{
		"$set": bson.M{
			"lastActivity": time.Now(),
		},
	}

	result, err := r.collection.UpdateOne(context.Background(), filter, upd)
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrUserNotFound
	}

	return nil
}

func (r *UserRepoMongoDB) GetAPITokenByValue(_ context.Context, userID, token string) (*entity.APIToken, error) {
	user, err := r.GetByID(userID)
	if err != nil {
		return nil, err
	}
	if len(user.APITokens) == 0 {
		return nil, usecase.ErrAPITokenNotFound
	}

	for _, apiToken := range user.APITokens {
		if apiToken.Token == token {
			return &apiToken, nil
		}
	}

	return nil, usecase.ErrAPITokenNotFound
}

func (r *UserRepoMongoDB) GetAPITokenById(_ context.Context, userID, tokenID string) (*entity.APIToken, error) {
	user, err := r.GetByID(userID)
	if err != nil {
		return nil, err
	}
	if len(user.APITokens) == 0 {
		return nil, usecase.ErrAPITokenNotFound
	}

	for _, apiToken := range user.APITokens {
		if apiToken.Id == tokenID {
			return &apiToken, nil
		}
	}

	return nil, usecase.ErrAPITokenNotFound
}

func (r *UserRepoMongoDB) DeleteAPIToken(ctx context.Context, userID, tokenID string) error {
	filter := bson.M{
		"_id": userID,
	}

	upd := bson.M{
		"$pull": bson.M{"apiTokens": bson.M{"_id": tokenID}},
	}

	result, err := r.collection.UpdateOne(ctx, filter, upd)
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrAPITokenNotFound
	}

	return nil

}

func (r *UserRepoMongoDB) SaveAPIToken(ctx context.Context, name, userID, token string) error {
	filter := bson.M{
		"_id": userID,
	}

	now := time.Now()

	apiToken := entity.APIToken{
		Id:           primitive.NewObjectID().Hex(),
		Name:         name,
		CreationDate: now,
		LastActivity: nil,
		Token:        token,
	}

	upd := bson.M{
		"$push": bson.M{"apiTokens": apiToken},
	}

	result, err := r.collection.UpdateOne(ctx, filter, upd)
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrUserNotFound
	}

	return nil
}

func (r *UserRepoMongoDB) UpdateAPITokenLastActivity(ctx context.Context, userID, token string) error {
	filter := bson.M{
		"_id": userID,
		"apiTokens": bson.M{
			"$elemMatch": bson.M{"token": token},
		},
	}

	upd := bson.M{
		"$set": bson.M{
			"apiTokens.$.lastActivity": time.Now(),
		},
	}

	result, err := r.collection.UpdateOne(ctx, filter, upd)
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrInvalidAPIToken
	}

	return nil
}
