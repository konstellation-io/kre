package http

import (
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/delivery/http/controller"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

// App is the top-level struct.
type App struct {
	server *echo.Echo
	cfg    *config.Config
	logger logging.Logger
}

// NewApp creates a new App instance.
func NewApp(cfg *config.Config, logger logging.Logger, authInteractor *usecase.AuthInteractor, runtimeInteractor *usecase.RuntimeInteractor, userInteractor *usecase.UserInteractor) *App {
	e := echo.New()
	e.HideBanner = true
	e.Validator = newCustomValidator()

	e.Use(
		middleware.RequestID(),
		middleware.Logger(),
	)

	if cfg.Admin.CORSEnabled {
		e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins:     []string{cfg.Admin.FrontEndBaseURL},
			AllowCredentials: true,
		}))
	}

	authController := controller.NewAuthController(cfg, logger, authInteractor)
	graphQLController := controller.NewGraphQLController(cfg, logger, runtimeInteractor, userInteractor)

	e.POST("/api/v1/auth/signin", authController.SignIn)
	e.POST("/api/v1/auth/signin/verify", authController.SignInVerify)

	// Restricted group
	r := e.Group("/graphql")
	r.Use(middleware.JWTWithConfig(middleware.JWTConfig{
		SigningKey:  []byte(cfg.Auth.JWTSignSecret),
		TokenLookup: "cookie:token",
	}))
	r.POST("", graphQLController.GraphQLHandler)
	r.GET("/playground", graphQLController.PlaygroundHandler)

	return &App{
		e,
		cfg,
		logger,
	}
}

// Start runs the HTTP server.
func (a *App) Start() {
	a.server.Logger.Fatal(a.server.Start(a.cfg.Admin.APIAddress))
}
