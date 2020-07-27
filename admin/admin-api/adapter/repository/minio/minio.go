package minio

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/minio/minio-go/v6"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/repository"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
)

type Minio struct {
	logger logging.Logger
	client *minio.Client
}

func CreateStorage(logger logging.Logger, runtime *entity.Runtime) (repository.Storage, error) {
	endpoint := fmt.Sprintf("kre-minio.%s:9000", runtime.GetNamespace())

	fmt.Printf("Minio endpoint: %s", endpoint)
	client, err := minio.New(endpoint, runtime.Minio.AccessKey, runtime.Minio.SecretKey, false)
	if err != nil {
		return nil, fmt.Errorf("error Minio Connection to %s: %w", endpoint, err)
	}

	return Minio{logger, client}, nil
}

func (m Minio) CreateBucket(name string) error {
	location := ""

	exists, err := m.client.BucketExists(name)
	if err != nil {
		return fmt.Errorf("error verifying if bucket '%s' exists: %w", name, err)
	}

	if !exists {
		err = m.client.MakeBucket(name, location)
		if err != nil {
			return fmt.Errorf("error Creating Bucket %s: %w", name, err)
		}

		m.logger.Infof("Bucket %s created", name)
	}

	return nil
}

func (m Minio) CopyDir(dir, bucketName string) error {
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return fmt.Errorf("error Reading files from %s: %w", path, err)
		}
		if info.IsDir() {
			return nil
		}
		m.logger.Infof("Uploading file %s", path)
		filePath, _ := filepath.Rel(dir, path)
		_, err = m.client.FPutObject(bucketName, filePath, path, minio.PutObjectOptions{})
		if err != nil {
			return fmt.Errorf("error Uploading file %s: %w", path, err)
		}
		return nil
	})

	if err != nil {
		return fmt.Errorf("error Listing files on dir %s: %w", dir, err)
	}

	m.logger.Infof("directory %s successfully copied", dir)

	return nil
}
