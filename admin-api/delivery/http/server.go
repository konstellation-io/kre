package http

import (
	"github.com/labstack/echo"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/delivery/http/controller"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

// App is the top-level struct.
type App struct {
	server         *echo.Echo
	cfg            *config.Config
	logger         logging.Logger
	authInteractor *usecase.AuthInteractor
}

// NewApp creates a new App instance.
func NewApp(cfg *config.Config, logger logging.Logger, authInteractor *usecase.AuthInteractor) *App {
	e := echo.New()
	e.Validator = newCustomValidator()

	authController := controller.NewAuthController(cfg, logger, authInteractor)

	e.POST("/api/v1/auth/signin", authController.SignIn)

	return &App{
		e,
		cfg,
		logger,
		authInteractor,
	}
}

// Start runs the HTTP server.
func (a *App) Start() {
	a.server.Logger.Fatal(a.server.Start(a.cfg.Server.Address))
}
