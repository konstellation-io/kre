package middleware

import (
	"context"
	"github.com/labstack/echo"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/dataloader"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"time"
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
						return nil, err
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
