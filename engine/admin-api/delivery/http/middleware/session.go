package middleware

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/auth"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/httperrors"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

func NewSessionMiddleware(cfg *config.Config, logger logging.Logger, authInteractor usecase.AuthInteracter) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := c.Get("user").(*jwt.Token)
			claims := user.Claims.(jwt.MapClaims)
			userID := claims["sub"].(string)

			err := authInteractor.CheckSessionIsActive(user.Raw)
			if err != nil {
				logger.Errorf("Invalid session: %s", err)
				auth.DeleteSessionCookie(c, cfg)

				return httperrors.HTTPErrInvalidSession
			}

			err = authInteractor.UpdateLastActivity(userID)
			if err != nil {
				logger.Warnf("Error updating last access: %s", err)
			}

			return next(c)
		}
	}
}
