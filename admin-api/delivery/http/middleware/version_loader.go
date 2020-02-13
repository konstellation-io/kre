package middleware

import (
	"context"
	"github.com/labstack/echo"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/dataloader"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"time"
)

const VersionLoaderKey = "versionloader"

func NewVersionLoader(versionInteractor *usecase.VersionInteractor) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			r := c.Request()
			versionLoader := dataloader.NewVersionLoader(dataloader.VersionLoaderConfig{
				Wait:     50 * time.Millisecond,
				MaxBatch: 1000,
				Fetch: func(keys []string) ([]*entity.Version, []error) {
					versions, err := versionInteractor.GetByIDs(keys)
					if err != nil {
						return nil, err
					}

					// The result array must preserve the order of the keys arrays
					result := make([]*entity.Version, len(keys))
					for idx, key := range keys {
						var version *entity.Version
						for _, v := range versions {
							if v.ID == key {
								version = v
								break
							}
						}
						result[idx] = version
					}

					return result, nil
				},
			})
			ctx := context.WithValue(r.Context(), VersionLoaderKey, versionLoader)

			r = r.WithContext(ctx)
			c.SetRequest(r)

			return next(c)
		}
	}
}
