package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"
)

type AdminRepo interface {
	GrantRuntimeData(ctx context.Context, runtimeID string) error
}
