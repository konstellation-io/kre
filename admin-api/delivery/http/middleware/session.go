package middleware

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"gitlab.com/konstellation/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/kre/admin-api/delivery/http/auth"
	"gitlab.com/konstellation/kre/admin-api/delivery/http/httperrors"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
)

func NewSessionMiddleware(cfg *config.Config, logger logging.Logger, authInteractor *usecase.AuthInteractor) echo.MiddlewareFunc {
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

			err = authInteractor.UpdateLastAccess(userID)
			if err != nil {
				logger.Warnf("Error updating last access: %s", err)
			}

			return next(c)
		}
	}
}
