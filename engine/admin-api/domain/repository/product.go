package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type ProductRepo interface {
	Create(ctx context.Context, product *entity.Product) (*entity.Product, error)
	Get(ctx context.Context) (*entity.Product, error)
	FindAll(ctx context.Context) ([]*entity.Product, error)
	FindByIDs(ctx context.Context, productIDs []string) ([]*entity.Product, error)
	GetByID(ctx context.Context, productID string) (*entity.Product, error)
	GetByName(ctx context.Context, name string) (*entity.Product, error)
}
