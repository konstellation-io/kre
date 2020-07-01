package entity

import (
	"fmt"
	"strings"
	"time"
)

type RuntimeStatus string

const (
	RuntimeStatusCreating RuntimeStatus = "CREATING"
	RuntimeStatusStarted  RuntimeStatus = "STARTED"
	RuntimeStatusError    RuntimeStatus = "ERROR"
)

func (e RuntimeStatus) IsValid() bool {
	switch e {
	case RuntimeStatusCreating, RuntimeStatusStarted, RuntimeStatusError:
		return true
	}
	return false
}

func (e RuntimeStatus) String() string {
	return string(e)
}

type MinioConfig struct {
	AccessKey string `bson:"accessKey"`
	SecretKey string `bson:"secretKey"`
}

type MongoConfig struct {
	Username  string
	Password  string
	SharedKey string
}

type RuntimeStatusEntity struct {
	Name   string
	Status string
}

type Runtime struct {
	ID               string        `bson:"_id"`
	Name             string        `bson:"name"`
	Description      string        `bson:"description"`
	CreationDate     time.Time     `bson:"creationDate"`
	Owner            string        `bson:"owner"`
	Status           RuntimeStatus `bson:"status"`
	Minio            MinioConfig   `bson:"minio"`
	PublishedVersion string        `bson:"publishedVersion"`
	Mongo            MongoConfig
}

func (r *Runtime) GetNamespace() string {
	return fmt.Sprintf("kre-%s", strings.ToLower(r.Name))
}

func (r *Runtime) GetMongoURI(replicas int) string {
	creds := fmt.Sprintf("%s:%s", r.Mongo.Username, r.Mongo.Password)

	address := make([]string, replicas)
	for i := 0; i < replicas; i++ {
		address[i] = fmt.Sprintf("%s-mongo-%d.%s-mongo:27017", r.GetNamespace(), i, r.GetNamespace())
	}
	return fmt.Sprintf("mongodb://%s@%s/admin?replicaSet=rs0", creds, strings.Join(address, ","))
}
