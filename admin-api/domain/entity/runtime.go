package entity

import (
	"time"
)

type MinioConfig struct {
	AccessKey string `bson:"accessKey"`
	SecretKey string `bson:"secretKey"`
}

type MongoConfig struct {
	Username  string
	Password  string
	SharedKey string
}

type Runtime struct {
	ID           string      `bson:"_id"`
	Name         string      `bson:"name"`
	CreationDate time.Time   `bson:"creationDate"`
	Owner        string      `bson:"owner"`
	Status       string      `bson:"status"` // TODO use enum
	Minio        MinioConfig `bson:"minio"`
	Mongo        MongoConfig
}
