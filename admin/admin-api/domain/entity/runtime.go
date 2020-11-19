package entity

import (
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

type RuntimeStatus string

const (
	RuntimeStatusCreating RuntimeStatus = "CREATING"
	RuntimeStatusStarted  RuntimeStatus = "STARTED"
	RuntimeStatusError    RuntimeStatus = "ERROR"
)

var (
	validate             = validator.New()
	validRuntimeIDRegExp = regexp.MustCompile("^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$")
)

func init() {
	err := validate.RegisterValidation("runtime-id", runtimeIDValidator)
	if err != nil {
		log.Fatal(err)
	}
}

func runtimeIDValidator(fl validator.FieldLevel) bool {
	return validRuntimeIDRegExp.MatchString(fl.Field().String())
}

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
	ID               string        `bson:"_id" validate:"required,gte=3,lte=15,runtime-id"`
	Name             string        `bson:"name" validate:"required,lte=40"`
	Description      string        `bson:"description" validate:"required,lte=500"`
	CreationDate     time.Time     `bson:"creationDate"`
	Owner            string        `bson:"owner"`
	Status           RuntimeStatus `bson:"status"`
	Minio            MinioConfig   `bson:"minio"`
	PublishedVersion string        `bson:"publishedVersion"`
	Mongo            MongoConfig
	Monoruntime      bool   `bson:"monoruntime"`
	ReleaseName      string `bson:"releaseName"`
}

// Multi runtime: .Release.Name  == .Release.Namespace
// Mono  runtime: .Release.Name  != .Release.Namespace
func (r *Runtime) GetNamespace() string {
	if r.Monoruntime {
		return r.ID
	}
	return fmt.Sprintf("kre-%s", r.ID)
}

func (r *Runtime) GetMongoURI(replicas int) string {
	creds := fmt.Sprintf("%s:%s", r.Mongo.Username, r.Mongo.Password)

	address := make([]string, replicas)
	for i := 0; i < replicas; i++ {
		address[i] = fmt.Sprintf("kre-mongo-%d:27017", i)
	}
	return fmt.Sprintf("mongodb://%s@%s/admin?replicaSet=rs0", creds, strings.Join(address, ","))
}

func (r *Runtime) GetInfluxURL() string {
	return fmt.Sprintf("http://%s-influxdb:8086", r.ReleaseName)
}

func (r *Runtime) GetChronografURL() string {
	return fmt.Sprintf("http://chronograf.%s/measurements/%s", r.GetNamespace(), r.GetNamespace())
}

func (r *Runtime) GetMeasurementURL(baseURL string) string {
	return fmt.Sprintf("%s/measurements/%s", baseURL, r.GetNamespace())
}

func (r *Runtime) GetDatabaseURL(baseURL string) string {
	return fmt.Sprintf("%s/database/%s", baseURL, r.GetNamespace())
}

func (r *Runtime) GetEntrypointAddress(baseDomain string) string {
	return fmt.Sprintf("entrypoint.%s.%s", r.GetNamespace(), baseDomain)
}

func (r *Runtime) Validate() error {
	return validate.Struct(r)
}
