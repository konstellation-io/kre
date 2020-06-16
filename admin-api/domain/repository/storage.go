package repository

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/repo_${GOFILE} -package=mocks

import (
	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
)

type Storage interface {
	CreateBucket(name string) error
	CopyDir(dir, bucketName string) error
}

type CreateStorage func(logger logging.Logger, runtime *entity.Runtime) (Storage, error)
