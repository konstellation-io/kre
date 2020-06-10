package middleware

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"gitlab.com/konstellation/kre/admin-api/delivery/http/httperrors"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
)

func NewSessionMiddleware(logger logging.Logger, authInteractor *usecase.AuthInteractor) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := c.Get("user").(*jwt.Token)

			err := authInteractor.CheckSessionIsActive(user.Raw)
			if err != nil {
				logger.Errorf("Invalid session: %s", err)
				return httperrors.HTTPErrInvalidSession
			}

			return next(c)
		}
	}
}
