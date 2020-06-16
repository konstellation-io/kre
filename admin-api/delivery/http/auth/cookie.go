package auth

import (
	"net/http"
	"time"

	"github.com/labstack/echo"

	"github.com/konstellation-io/kre/admin-api/adapter/config"
)

func DeleteSessionCookie(c echo.Context, cfg *config.Config) {
	expirationTime := time.Now()
	CreateSessionCookie(c, cfg, "deleted", expirationTime)
}

func CreateSessionCookie(c echo.Context, cfg *config.Config, jwtToken string, expirationTime time.Time) {
	cookie := new(http.Cookie)
	cookie.Name = "token"
	cookie.Value = jwtToken
	cookie.Expires = expirationTime
	cookie.Path = "/"
	cookie.HttpOnly = true
	cookie.Secure = cfg.Auth.SecureCookie
	cookie.SameSite = http.SameSiteLaxMode
	cookie.Domain = cfg.Auth.CookieDomain

	c.SetCookie(cookie)
}
