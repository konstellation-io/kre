package repository

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

type Storage interface {
	CreateBucket(name string) error
	CopyDir(dir, bucketName string) error
}

type CreateStorage func(logger logging.Logger, runtime *entity.Runtime) (Storage, error)
