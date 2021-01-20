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

type VerificationCodeRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewVerificationCodeRepoMongoDB(cfg *config.Config, logger logging.Logger, client *mongo.Client) *VerificationCodeRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("verificationCodes")
	return &VerificationCodeRepoMongoDB{
		cfg,
		logger,
		collection,
	}
}

func (r *VerificationCodeRepoMongoDB) Store(code, uid string, ttl time.Duration) error {
	verificationCode := entity.VerificationCode{
		Code:      code,
		UID:       uid,
		ExpiresAt: time.Now().Add(ttl),
	}

	_, err := r.collection.InsertOne(context.Background(), verificationCode)
	if err != nil {
		return err
	}

	return nil
}

func (r *VerificationCodeRepoMongoDB) Get(code string) (*entity.VerificationCode, error) {
	verificationCode := &entity.VerificationCode{}
	filter := bson.D{{"code", code}}

	err := r.collection.FindOne(context.Background(), filter).Decode(&verificationCode)
	if err == mongo.ErrNoDocuments {
		return verificationCode, usecase.ErrVerificationCodeNotFound
	}

	return verificationCode, err
}

func (r *VerificationCodeRepoMongoDB) Delete(code string) error {
	res, err := r.collection.DeleteOne(context.Background(), bson.D{{"code", code}})

	if err != nil {
		return err
	}

	r.logger.Infof("Deleted %v verification code", res.DeletedCount)
	return nil
}
