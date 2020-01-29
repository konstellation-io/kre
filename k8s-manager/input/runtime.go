package input

// CreateRuntimeInput struct contains the new runtime definition
type CreateRuntimeInput struct {
	Name  string
	Minio MinioConfig
	Mongo MongoConfig
}

// MinioConfig contains credentials configuration for a given runtime
type MinioConfig struct {
	AccessKey string
	SecretKey string
}

// MongoConfig contains credentials configuration for the MongoDB for a given runtime
type MongoConfig struct {
	Username  string
	Password  string
	SharedKey string
}
