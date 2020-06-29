package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/konstellation-io/kre/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
)

type SessionRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewSessionRepoMongoDB(
	cfg *config.Config,
	logger logging.Logger,
	client *mongo.Client,
) *SessionRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("sessions")
	return &SessionRepoMongoDB{
		cfg:        cfg,
		logger:     logger,
		collection: collection,
	}
}

func (r *SessionRepoMongoDB) Create(session entity.Session) error {
	session.ID = primitive.NewObjectID().Hex()

	_, err := r.collection.InsertOne(context.Background(), session)
	if err != nil {
		return err
	}

	return nil
}

func (r *SessionRepoMongoDB) GetByToken(token string) (entity.Session, error) {
	session := entity.Session{}
	filter := bson.M{"token": token}

	err := r.collection.FindOne(context.Background(), filter).Decode(&session)
	if err == mongo.ErrNoDocuments {
		return session, usecase.ErrSessionNotFound
	}

	return session, err
}

func (r *SessionRepoMongoDB) DeleteByUserIDs(userIDs []string) error {
	filter := bson.M{
		"userId": bson.M{
			"$in": userIDs,
		},
	}

	result, err := r.collection.DeleteMany(context.Background(), filter)
	if err != nil {
		return err
	}

	r.logger.Infof("Deleted %d sessions of %d users", result.DeletedCount, len(userIDs))

	return nil
}

func (r *SessionRepoMongoDB) DeleteByToken(token string) error {
	filter := bson.M{"token": token}

	result, err := r.collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return err
	}

	if result != nil && result.DeletedCount != 1 {
		return usecase.ErrSessionNotFound
	}

	return nil
}

func (r *SessionRepoMongoDB) GetUserSessions(ctx context.Context, userID string) ([]entity.Session, error) {
	var sessions []entity.Session
	filter := bson.M{
		"userId":         userID,
		"expirationDate": bson.M{"$gt": time.Now()},
	}

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	err = cursor.All(ctx, &sessions)
	if err != nil {
		return nil, err
	}

	return sessions, nil
}
