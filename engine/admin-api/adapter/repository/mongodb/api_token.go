package mongodb

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"io"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/scrypt"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type APITokenRepoMongoDB struct {
	cfg            *config.Config
	logger         logging.Logger
	collection     *mongo.Collection
	tokenSecretKey []byte
}

func NewAPITokenRepoMongoDB(
	cfg *config.Config,
	logger logging.Logger,
	client *mongo.Client,
) (*APITokenRepoMongoDB, error) {

	apiTokens := &APITokenRepoMongoDB{
		cfg:        cfg,
		logger:     logger,
		collection: client.Database(cfg.MongoDB.DBName).Collection("api_tokens"),
	}

	apiTokens.createIndexes()
	err := apiTokens.createSecretKey()
	if err != nil {
		return nil, err
	}

	return apiTokens, err
}

func (a *APITokenRepoMongoDB) createIndexes() {
	indexes := []mongo.IndexModel{
		{
			Keys: bson.M{
				"userId": 1,
				"name":   1,
			},
			Options: options.Index().SetUnique(true),
		},
	}

	_, err := a.collection.Indexes().CreateMany(context.Background(), indexes)
	if err != nil {
		a.logger.Errorf("error creating user indexes: %s", err)
	}
}

func (a *APITokenRepoMongoDB) createSecretKey() error {
	salt, err := a.salt()
	if err != nil {
		return err
	}
	key, err := scrypt.Key([]byte(a.cfg.Auth.APITokenSecret), salt, 256*256, 8, 1, 16)
	if err != nil {
		return err
	}

	a.tokenSecretKey = key
	return nil
}

func (a *APITokenRepoMongoDB) salt() ([]byte, error) {
	salt := make([]byte, 32)
	if _, err := rand.Read(salt); err != nil {
		return nil, err
	}

	return salt, nil
}

func (a *APITokenRepoMongoDB) hashToken(token string) string {
	// NOTE: uncomment this line if we want to invalidate all existing tokens when the config secret changes
	//hash := md5.Sum(append([]byte(token), []byte(a.cfg.Auth.APITokenSecret)...))
	hash := md5.Sum([]byte(token))
	return hex.EncodeToString(hash[:])
}

func (a *APITokenRepoMongoDB) GenerateCode(userID string) (string, error) {
	block, err := aes.NewCipher(a.tokenSecretKey)
	if err != nil {
		return "", err
	}
	salt, err := a.salt()
	if err != nil {
		return "", err
	}

	b := base64.StdEncoding.EncodeToString(append([]byte(userID), salt...))
	token := make([]byte, aes.BlockSize+len(b))
	iv := token[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}
	cfb := cipher.NewCFBEncrypter(block, iv)
	cfb.XORKeyStream(token[aes.BlockSize:], []byte(b))

	code := hex.EncodeToString(token)

	return code, nil
}

func (a *APITokenRepoMongoDB) Create(ctx context.Context, apiToken entity.APIToken, code string) error {
	apiToken.ID = primitive.NewObjectID().Hex()
	apiToken.Hash = a.hashToken(code)
	apiToken.CreationDate = time.Now()

	total, err := a.collection.CountDocuments(ctx, bson.M{"name": apiToken.Name, "userId": apiToken.UserID})
	if total > 0 {
		return usecase.ErrAPITokenNameDup
	}
	if err != nil {
		return err
	}

	_, err = a.collection.InsertOne(ctx, apiToken)
	if err != nil {
		return err
	}

	return nil
}

func (a *APITokenRepoMongoDB) GetByToken(ctx context.Context, token string) (*entity.APIToken, error) {
	apiToken := &entity.APIToken{}
	filter := bson.M{"hash": a.hashToken(token)}

	err := a.collection.FindOne(ctx, filter).Decode(&apiToken)
	if err == mongo.ErrNoDocuments {
		return nil, usecase.ErrAPITokenNotFound
	}

	return apiToken, err
}

func (a *APITokenRepoMongoDB) GetByID(ctx context.Context, id string) (*entity.APIToken, error) {
	apiToken := &entity.APIToken{}
	filter := bson.M{"_id": id}

	err := a.collection.FindOne(ctx, filter).Decode(&apiToken)
	if err == mongo.ErrNoDocuments {
		return nil, usecase.ErrAPITokenNotFound
	}

	return apiToken, err
}

func (a *APITokenRepoMongoDB) GetByUserID(ctx context.Context, userID string) ([]*entity.APIToken, error) {
	var list []*entity.APIToken
	filter := bson.M{"userId": userID}

	cursor, err := a.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	err = cursor.All(ctx, &list)
	if err != nil {
		return nil, err
	}

	return list, err
}

func (a *APITokenRepoMongoDB) DeleteById(ctx context.Context, id string) error {
	filter := bson.M{"_id": id}

	result, err := a.collection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}

	if result != nil && result.DeletedCount != 1 {
		return usecase.ErrAPITokenNotFound
	}

	return nil
}

func (a *APITokenRepoMongoDB) DeleteByUserIDs(ctx context.Context, userIDs []string) error {
	filter := bson.M{
		"userId": bson.M{
			"$in": userIDs,
		},
	}

	result, err := a.collection.DeleteMany(ctx, filter)
	if err != nil {
		return err
	}

	a.logger.Infof("Deleted %d api tokens of %d users", result.DeletedCount, len(userIDs))

	return nil
}

func (a *APITokenRepoMongoDB) UpdateLastActivity(ctx context.Context, id string) error {
	filter := bson.M{
		"_id": id,
	}

	upd := bson.M{
		"$set": bson.M{
			"lastActivity": time.Now(),
		},
	}

	result, err := a.collection.UpdateOne(ctx, filter, upd)
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrInvalidAPIToken
	}

	return nil
}
