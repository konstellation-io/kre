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

func (a *AdminRepoMongoDB) GrantReadPermission(ctx context.Context, runtimeDataDB string) error {
	res := a.db.RunCommand(ctx, bson.D{
		{"grantRolesToUser", a.cfg.MongoDB.RuntimeDataUser}, {"roles", []bson.M{{"role": "read", "db": runtimeDataDB}}},
	})
	if res.Err() != nil {
		return res.Err()
	}
	return nil
}
