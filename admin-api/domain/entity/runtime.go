package entity

import (
	"fmt"
	"strings"
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

type RuntimeStatus struct {
	Name   string
	Status string
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

func (r *Runtime) GetNamespace() string {
	return fmt.Sprintf("kre-%s", strings.ToLower(r.Name))
}
