package mongodb

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type ProductRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewProductRepoMongoDB(cfg *config.Config, logger logging.Logger, client *mongo.Client) *ProductRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("products")

	productRepo := &ProductRepoMongoDB{
		cfg,
		logger,
		collection,
	}

	productRepo.createIndexes()

	return productRepo
}

func (r *ProductRepoMongoDB) createIndexes() {
	_, err := r.collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys: bson.M{
			"name": 1,
		},
	})
	if err != nil {
		r.logger.Errorf("error creating products collection indexes: %s", err)
	}
}

func (r *ProductRepoMongoDB) Create(ctx context.Context, product *entity.Product) (*entity.Product, error) {
	product.CreationDate = time.Now().UTC()

	_, err := r.collection.InsertOne(ctx, product)
	if err != nil {
		return nil, err
	}

	return product, nil
}

func (r *ProductRepoMongoDB) Get(ctx context.Context) (*entity.Product, error) {
	product := &entity.Product{}

	err := r.collection.FindOne(ctx, bson.M{}).Decode(product)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, usecase.ErrProductNotFound
	}

	return product, err
}

func (r *ProductRepoMongoDB) GetByID(ctx context.Context, productID string) (*entity.Product, error) {
	product := &entity.Product{}
	filter := bson.M{"_id": productID}

	err := r.collection.FindOne(ctx, filter).Decode(product)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, usecase.ErrProductNotFound
	}

	return product, err
}

func (r *ProductRepoMongoDB) GetByName(ctx context.Context, name string) (*entity.Product, error) {
	product := &entity.Product{}
	filter := bson.M{"name": name}

	err := r.collection.FindOne(ctx, filter).Decode(product)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, usecase.ErrProductNotFound
	}

	return product, err
}

func (r *ProductRepoMongoDB) FindAll(ctx context.Context) ([]*entity.Product, error) {
	var products []*entity.Product

	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return products, err
	}

	err = cursor.All(ctx, &products)
	if err != nil {
		return nil, err
	}

	return products, nil
}

func (r *ProductRepoMongoDB) FindByIDs(ctx context.Context, ids []string) ([]*entity.Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{"_id": bson.M{"$in": ids}})
	if err != nil {
		return nil, err
	}

	var products []*entity.Product
	err = cursor.All(ctx, &products)
	if err != nil {
		return nil, err
	}

	return products, nil
}
