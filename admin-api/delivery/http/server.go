package http

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/delivery/http/controller"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"net/http"
)

// App is the top-level struct.
type App struct {
	server         *echo.Echo
	cfg            *config.Config
	logger         logging.Logger
	authInteractor *usecase.AuthInteractor
}

func restricted(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	name := claims["sub"].(string)
	return c.String(http.StatusOK, "Welcome "+name+"!")
}

// NewApp creates a new App instance.
func NewApp(cfg *config.Config, logger logging.Logger, authInteractor *usecase.AuthInteractor) *App {
	e := echo.New()
	e.Validator = newCustomValidator()

	if cfg.Admin.CORSEnabled {
		e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins:     []string{cfg.Admin.FrontEndBaseURL},
			AllowCredentials: true,
		}))
	}

	authController := controller.NewAuthController(cfg, logger, authInteractor)

	e.POST("/api/v1/auth/signin", authController.SignIn)
	e.POST("/api/v1/auth/signin/verify", authController.SignInVerify)

	// Restricted group
	r := e.Group("/graphql")
	r.Use(middleware.JWTWithConfig(middleware.JWTConfig{
		SigningKey:  []byte(cfg.Auth.JWTSignSecret),
		TokenLookup: "cookie:token",
	}))
	r.GET("", restricted)

	return &App{
		e,
		cfg,
		logger,
		authInteractor,
	}
}

// Start runs the HTTP server.
func (a *App) Start() {
	a.server.Logger.Fatal(a.server.Start(a.cfg.Admin.APIAddress))
}
