package middleware

import (
	"strings"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/httperrors"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"github.com/labstack/echo"
)

func extractToken(authHeader string) string {
	if len(strings.Split(authHeader, " ")) == 2 {
		return strings.Split(authHeader, " ")[1]
	}
	return ""
}

func NewJwtAuthMiddleware(_ *config.Config, logger logging.Logger, tokenParser *token.Parser) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			plainToken := extractToken(authHeader)

			user, err := tokenParser.GetUserRoles(plainToken)
			if err != nil {
				logger.Error("No token found in context")
				return httperrors.HTTPErrUnauthorized
			}

			c.Set("user", user)

			return next(c)
		}
	}
}
