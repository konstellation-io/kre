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

func (r *VersionRepoMongoDB) Create(userID string, newVersion *entity.Version) (*entity.Version, error) {
	newVersion.ID = primitive.NewObjectID().Hex()
	newVersion.CreationDate = time.Now().UTC()
	newVersion.CreationAuthor = userID
	newVersion.Status = entity.VersionStatusStopped
	res, err := r.collection.InsertOne(context.Background(), newVersion)
	if err != nil {
		return nil, err
	}

	newVersion.ID = res.InsertedID.(string)
	return newVersion, nil
}

func (r *VersionRepoMongoDB) GetByID(id string) (*entity.Version, error) {
	v := &entity.Version{}
	filter := bson.D{{"_id", id}}

	err := r.collection.FindOne(context.Background(), filter).Decode(v)
	if err == mongo.ErrNoDocuments {
		return v, usecase.ErrVersionNotFound
	}

	return v, err
}

func (r *VersionRepoMongoDB) GetByIDs(ids []string) ([]*entity.Version, []error) {
	ctx, _ := context.WithTimeout(context.Background(), 60*time.Second)
	var versions []*entity.Version
	cur, err := r.collection.Find(ctx, bson.M{"_id": bson.M{"$in": ids}})
	if err != nil {
		return versions, []error{err}
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var v entity.Version
		err = cur.Decode(&v)
		if err != nil {
			return versions, []error{err}
		}
		versions = append(versions, &v)
	}

	return versions, nil
}

func (r *VersionRepoMongoDB) Update(version *entity.Version) error {
	_, err := r.collection.ReplaceOne(context.Background(), bson.M{"_id": version.ID}, version)
	if err != nil {
		return err
	}

	return nil
}

func (r *VersionRepoMongoDB) GetByRuntime(runtimeID string) ([]*entity.Version, error) {
	ctx, _ := context.WithTimeout(context.Background(), 60*time.Second)
	var versions []*entity.Version
	cur, err := r.collection.Find(ctx, bson.M{"runtimeId": runtimeID})
	if err != nil {
		return versions, err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var v entity.Version
		err = cur.Decode(&v)
		if err != nil {
			return versions, err
		}
		versions = append(versions, &v)
	}

	return versions, nil
}

func (r *VersionRepoMongoDB) SetHasDoc(ctx context.Context, versionID string, hasDoc bool) error {
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": versionID}, bson.M{"$set": bson.M{"hasDoc": hasDoc}})
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrVersionNotFound
	}

	return nil
}

func (r *VersionRepoMongoDB) SetStatus(ctx context.Context, versionID string, status entity.VersionStatus) error {
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": versionID}, bson.M{"$set": bson.M{"status": status}})
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrVersionNotFound
	}

	return nil
}
