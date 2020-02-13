package minio

import (
	"fmt"

	"github.com/minio/minio-go/v6"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

type MinioFactory struct {
	logger logging.Logger
}

type MinioClient struct {
	logger logging.Logger
	client *minio.Client
}

type MinioRepo interface {
	NewClient(logger logging.Logger, runtime *entity.Runtime) (*MinioClient, error)
	CreateBucket(name string, minioClient *MinioClient) (Bucket, error)
}

func NewMinioRepo(logger logging.Logger) MinioRepo {
	var minioRepo MinioRepo = &MinioFactory{logger}
	return minioRepo
}

func (f *MinioFactory) NewClient(logger logging.Logger, runtime *entity.Runtime) (*MinioClient, error) {
	logger.Info("Minio connecting...")

	endpoint := fmt.Sprintf("kre-minio.%s:9000", runtime.GetNamespace())
	accessKeyID := runtime.Minio.AccessKey
	secretAccessKey := runtime.Minio.SecretKey
	useSSL := false

	fmt.Printf("Minio data: %#v \n endpoint: %s", runtime, endpoint)
	client, err := minio.New(endpoint, accessKeyID, secretAccessKey, useSSL)
	if err != nil {
		return nil, fmt.Errorf("error Minio Connection to %s: %w", endpoint, err)
	}

	logger.Info("Minio connected")

	return &MinioClient{logger, client}, nil
}
