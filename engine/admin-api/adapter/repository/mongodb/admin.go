package mongodb

import (
	"context"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	adminDatabase = "admin"
)

type AdminRepoMongoDB struct {
	cfg    *config.Config
	logger logging.Logger
	db     *mongo.Database
}

func NewAdminRepoMongoDB(cfg *config.Config, logger logging.Logger, client *mongo.Client) *AdminRepoMongoDB {
	db := client.Database(adminDatabase)
	return &AdminRepoMongoDB{
		cfg,
		logger,
		db,
	}
}

func (a *AdminRepoMongoDB) GrantRuntimeData(ctx context.Context, runtimeID string) error {
	res := a.db.RunCommand(ctx, bson.D{
		{"grantRolesToUser", "kre-runtime-data"}, {"roles", []bson.M{{"role": "read", "db": runtimeID + "-data"}}},
	})
	if res.Err() != nil {
		return res.Err()
	}
	return nil
}
