package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

import (
	"context"
)

type AdminRepo interface {
	GrantReadPermission(ctx context.Context, runtimeDataDB string) error
}
