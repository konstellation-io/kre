package middleware

import (
	"context"
	"time"

	"github.com/labstack/echo"

	"github.com/konstellation-io/kre/admin-api/adapter/dataloader"
	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase"
)

const UserLoaderKey = "userloader"

func NewUserLoader(userInteractor *usecase.UserInteractor) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			r := c.Request()
			userLoader := dataloader.NewUserLoader(dataloader.UserLoaderConfig{
				Wait:     50 * time.Millisecond,
				MaxBatch: 1000,
				Fetch: func(keys []string) ([]*entity.User, []error) {
					users, err := userInteractor.GetByIDs(keys)
					if err != nil {
						return nil, []error{err}
					}

					// The result array must preserve the order of the keys arrays
					result := make([]*entity.User, len(keys))
					for idx, key := range keys {
						var user *entity.User
						for _, u := range users {
							if u.ID == key {
								user = u
								break
							}
						}
						result[idx] = user
					}

					return result, nil
				},
			})
			ctx := context.WithValue(r.Context(), UserLoaderKey, userLoader)

			r = r.WithContext(ctx)
			c.SetRequest(r)

			return next(c)
		}
	}
}
