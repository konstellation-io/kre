package middleware

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/auth"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/httperrors"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"github.com/labstack/echo/v4"
)

func NewJwtAuthMiddleware(cfg *config.Config, logger logging.Logger, authInteractor usecase.AuthInteracter) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			token.NewParser(nil).GetUserRoles(c.Get("user").(string))

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
