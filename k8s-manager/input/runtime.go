package input

// CreateRuntimeInput struct contains the new runtime definition
type CreateRuntimeInput struct {
	Name  string
	Minio MinioConfig
}

// MinioConfig contains credentials configuration for a given runtime
type MinioConfig struct {
	AccessKey string
	SecretKey string
}
