package minio

import (
	"errors"
	"fmt"
	"github.com/minio/minio-go/v6"
	"os"
	"path/filepath"
)

type BucketObject struct {
	Name string
}

type Bucket interface {
	CopyDir(dir string, minioClient *MinioClient) error
}

func (m *MinioFactory) CreateBucket(name string, minioClient *MinioClient) (Bucket, error) {
	m.logger.Info("---------------- CREATING BUCKECT ------------")
	client := minioClient.client
	// Make version bucket
	location := ""

	exists, err := client.BucketExists(name)
	if err != nil {
		m.logger.Error(fmt.Sprintf("error verifying if  Bucket %s exists", name))
		return nil, fmt.Errorf("error verifying if  Bucket %s exists: %w", name, err)
	}
	if exists {
		m.logger.Error(fmt.Sprintf("Bucket %s already exists", name))
		return nil, errors.New(fmt.Sprintf("Bucket %s already exists", name))
	}

	err = client.MakeBucket(name, location)
	if err != nil {
		m.logger.Error(fmt.Sprintf("error Creating Bucket %s", name))
		return nil, fmt.Errorf("error Creating Bucket %s: %w", name, err)
	}

	m.logger.Info(fmt.Sprintf("Bucket %s connected", name))

	return &BucketObject{
		Name: name,
	}, nil
}

func (b *BucketObject) CopyDir(dir string, minioClient *MinioClient) error {
	// Copy all KRT files
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return fmt.Errorf("error Reading files from %s: %w", path, err)
		}
		// Upload the zip file
		if info.IsDir() {
			return nil
		}
		minioClient.logger.Info(fmt.Sprintf("Uploading file %s", path))
		filePath, _ := filepath.Rel(dir, path)
		_, err = minioClient.client.FPutObject(b.Name, filePath, path, minio.PutObjectOptions{})
		if err != nil {
			minioClient.logger.Error(fmt.Sprintf("error Uploading file %s", path))
			return fmt.Errorf("error Uploading file %s: %w", path, err)
		}

		return nil
	})
	if err != nil {
		minioClient.logger.Error(fmt.Sprintf("error Listing files on dir %s", dir))
		return fmt.Errorf("error Listing files on dir %s: %w", dir, err)
	}

	minioClient.logger.Info(fmt.Sprintf("Directory %s successfully copied", dir))

	return nil
}
