package mongodb

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import "context"

type MongoManager interface {
	Connect() error
	Disconnect() error
	InsertOne(ctx context.Context, db, coll string, doc interface{}) error
	InsertMany(ctx context.Context, db, coll string, docs interface{}) error
	TotalInserts() int64
}
