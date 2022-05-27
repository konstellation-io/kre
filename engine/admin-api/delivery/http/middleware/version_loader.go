package middleware

import (
	"context"
	"time"

	"github.com/labstack/echo"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/dataloader"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
)

const VersionLoaderKey = "versionloader"

func NewVersionLoader(versionInteractor *usecase.VersionInteractor) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			r := c.Request()
			versionLoader := dataloader.NewVersionLoader(dataloader.VersionLoaderConfig{
				Wait:     50 * time.Millisecond,
				MaxBatch: 1000,
				Fetch:    fetch(versionInteractor),
			})
			ctx := context.WithValue(r.Context(), VersionLoaderKey, versionLoader)

			r = r.WithContext(ctx)
			c.SetRequest(r)

			return next(c)
		}
	}
}

func fetch(versionInteractor *usecase.VersionInteractor) func(keys []string) ([]*entity.Version, []error) {
	return func(keys []string) ([]*entity.Version, []error) {
		versions, err := versionInteractor.GetByIDs(keys)
		if err != nil {
			return nil, err
		}

		result := constructVersions(keys, versions)

		return result, nil
	}
}

func constructVersions(keys []string, versions []*entity.Version) []*entity.Version {
	// The result array must preserve the order of the keys arrays
	result := make([]*entity.Version, len(keys))
	for idx, key := range keys {
		var ver *entity.Version
		for _, v := range versions {
			if v.ID == key {
				ver = v
				break
			}
		}
		result[idx] = ver
	}
	return result
}
