package input

type CreateRuntimeInput struct {
	Name  string
	Minio MinioConfig
}

type MinioConfig struct {
	AccessKey string
	SecretKey string
}
