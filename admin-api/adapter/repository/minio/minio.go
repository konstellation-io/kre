package minio

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/minio/minio-go/v6"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

type Minio struct {
	logger logging.Logger
	client *minio.Client
}

func CreateStorage(logger logging.Logger, runtime *entity.Runtime) (repository.Storage, error) {
	useSSL := false
	endpoint := fmt.Sprintf("kre-minio.%s:9000", runtime.GetNamespace())

	fmt.Printf("Minio endpoint: %s", endpoint)
	client, err := minio.New(endpoint, runtime.Minio.AccessKey, runtime.Minio.SecretKey, useSSL)
	if err != nil {
		return nil, fmt.Errorf("error Minio Connection to %s: %w", endpoint, err)
	}

	return Minio{logger, client}, nil
}

func (m Minio) CreateBucket(name string) error {
	location := ""

	exists, err := m.client.BucketExists(name)
	if err != nil {
		return fmt.Errorf("error verifying if  Bucket %s exists: %w", name, err)
	}
	if exists {
		m.logger.Error(fmt.Sprintf("Bucket %s already exists", name))
		return errors.New(fmt.Sprintf("Bucket %s already exists", name))
	}

	err = m.client.MakeBucket(name, location)
	if err != nil {
		return fmt.Errorf("error Creating Bucket %s: %w", name, err)
	}

	m.logger.Info(fmt.Sprintf("Bucket %s created", name))

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
		m.logger.Info(fmt.Sprintf("Uploading file %s", path))
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

	m.logger.Info(fmt.Sprintf("directory %s successfully copied", dir))

	return nil
}
