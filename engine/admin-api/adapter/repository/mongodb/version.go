package mongodb

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo/gridfs"
	"go.mongodb.org/mongo-driver/mongo/options"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

const versionsCollectionName = "versions"

type VersionRepoMongoDB struct {
	cfg    *config.Config
	logger logging.Logger
	client *mongo.Client
}

func NewVersionRepoMongoDB(
	cfg *config.Config,
	logger logging.Logger,
	client *mongo.Client,
) *VersionRepoMongoDB {
	versions := &VersionRepoMongoDB{
		cfg,
		logger,
		client,
	}

	return versions
}

func (r *VersionRepoMongoDB) CreateIndexes(ctx context.Context, productID string) error {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	indexes := []mongo.IndexModel{
		{
			Keys: bson.M{
				"name": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	}

	_, err := collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		return err
	}

	return nil
}

func (r *VersionRepoMongoDB) Create(userID, productID string, newVersion *entity.Version) (*entity.Version, error) {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	newVersion.ID = primitive.NewObjectID().Hex()
	newVersion.CreationDate = time.Now().UTC()
	newVersion.CreationAuthor = userID
	newVersion.Status = entity.VersionStatusCreating

	res, err := collection.InsertOne(context.Background(), newVersion)
	if err != nil {
		return nil, err
	}

	newVersion.ID = res.InsertedID.(string)

	return newVersion, nil
}

func (r *VersionRepoMongoDB) GetByID(productID, versionID string) (*entity.Version, error) {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	v := &entity.Version{}
	filter := bson.M{"_id": versionID}

	err := collection.FindOne(context.Background(), filter).Decode(v)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return v, usecase.ErrVersionNotFound
	}

	return v, err
}

func (r *VersionRepoMongoDB) GetByName(ctx context.Context, productID, name string) (*entity.Version, error) {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	v := &entity.Version{}
	filter := bson.M{"name": name}

	err := collection.FindOne(ctx, filter).Decode(v)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, usecase.ErrVersionNotFound
	}

	return v, err
}

func (r *VersionRepoMongoDB) Update(productID string, version *entity.Version) error {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	_, err := collection.ReplaceOne(context.Background(), bson.M{"_id": version.ID}, version)
	if err != nil {
		return err
	}

	return nil
}

//nolint:dupl // legacy code
func (r *VersionRepoMongoDB) GetByProduct(productID string) ([]*entity.Version, error) {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	// TODO: easy fix
	//nolint:govet // legacy code
	ctx, _ := context.WithTimeout(context.Background(), 60*time.Second)

	var versions []*entity.Version

	cur, err := collection.Find(ctx, bson.M{})

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

//nolint:dupl // legacy code
func (r *VersionRepoMongoDB) GetAll(productID string) ([]*entity.Version, error) {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	// TODO: easy fix
	//nolint:govet // legacy code
	ctx, _ := context.WithTimeout(context.Background(), 60*time.Second)

	var versions []*entity.Version

	cur, err := collection.Find(ctx, bson.M{})

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

func (r *VersionRepoMongoDB) SetHasDoc(ctx context.Context, productID, versionID string, hasDoc bool) error {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	result, err := collection.UpdateOne(ctx, bson.M{"_id": versionID}, bson.M{"$set": bson.M{"hasDoc": hasDoc}})
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrVersionNotFound
	}

	return nil
}

func (r *VersionRepoMongoDB) SetStatus(ctx context.Context, productID, versionID string, status entity.VersionStatus) error {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	result, err := collection.UpdateOne(ctx, bson.M{"_id": versionID}, bson.M{"$set": bson.M{"status": status}})
	if err != nil {
		return err
	}

	if result.ModifiedCount != 1 {
		return usecase.ErrVersionNotFound
	}

	return nil
}

func (r *VersionRepoMongoDB) SetErrors(ctx context.Context, productID string, version *entity.Version, errorMessages []string) (*entity.Version, error) {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	version.Status = entity.VersionStatusError
	version.Errors = errorMessages

	elem := bson.M{"$set": bson.M{"status": version.Status, "errors": version.Errors}}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": version.ID}, elem)
	if err != nil {
		return nil, err
	}

	if result.ModifiedCount != 1 {
		return nil, usecase.ErrVersionNotFound
	}

	return version, nil
}

func (r *VersionRepoMongoDB) UploadKRTFile(productID string, version *entity.Version, file string) error {
	data, err := os.ReadFile(file)
	if err != nil {
		return fmt.Errorf("reading KRT file at %s: %w", file, err)
	}

	bucket, err := gridfs.NewBucket(
		r.client.Database(productID),
		options.GridFSBucket().SetName(r.cfg.MongoDB.KRTBucket),
	)
	if err != nil {
		return fmt.Errorf("creating bucket %q to store KRT files: %w", r.cfg.MongoDB.DBName, err)
	}

	filename := fmt.Sprintf("%s.krt", version.Name)

	uploadStream, err := bucket.OpenUploadStreamWithID(
		version.ID,
		filename,
	)
	if err != nil {
		return fmt.Errorf("opening KRT upload stream: %w", err)
	}
	defer uploadStream.Close()

	fileSize, err := uploadStream.Write(data)
	if err != nil {
		return fmt.Errorf("writing into the KRT upload stream: %w", err)
	}

	r.logger.Infof("Uploaded %d bytes of %q to GridFS successfully", filename, fileSize)

	return nil
}

func (r *VersionRepoMongoDB) ClearPublishedVersion(ctx context.Context, productID string) (*entity.Version, error) {
	collection := r.client.Database(productID).Collection(versionsCollectionName)

	oldPublishedVersion := &entity.Version{}

	filter := bson.M{"status": entity.VersionStatusPublished}
	upd := bson.M{
		"$set": bson.M{
			"status":            entity.VersionStatusStarted,
			"publicationDate":   nil,
			"publicationUserId": nil,
		},
	}

	result := collection.FindOneAndUpdate(ctx, filter, upd)
	err := result.Decode(oldPublishedVersion)

	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}

	return oldPublishedVersion, nil
}
