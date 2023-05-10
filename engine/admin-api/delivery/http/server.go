package http

import (
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/controller"
	kremiddleware "github.com/konstellation-io/kre/engine/admin-api/delivery/http/middleware"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

// App is the top-level struct.
type App struct {
	server *echo.Echo
	cfg    *config.Config
	logger logging.Logger
}

const logFormat = "${time_rfc3339} INFO remote_ip=${remote_ip}, method=${method}, uri=${uri}, status=${status}" +
	", bytes_in=${bytes_in}, bytes_out=${bytes_out}, latency=${latency}, referer=${referer}" +
	", user_agent=${user_agent}, error=${error}\n"

// NewApp creates a new App instance.
func NewApp(
	cfg *config.Config,
	logger logging.Logger,
	gqlController controller.GraphQL,
) *App {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	e.Validator = newCustomValidator()

	e.Static("/static", cfg.Admin.StoragePath)

	e.Use(
		middleware.RequestID(),
		middleware.LoggerWithConfig(middleware.LoggerConfig{
			Format: logFormat,
		}),
	)

	if cfg.Admin.CORSEnabled {
		e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins:     []string{cfg.Admin.FrontEndBaseURL},
			AllowCredentials: true,
		}))
	}

	tokenParser := token.NewParser()

	jwtAuthMiddleware := kremiddleware.NewJwtAuthMiddleware(cfg, logger, tokenParser)
	e.GET("/", func(c echo.Context) error {
		return nil
	}, jwtAuthMiddleware)

	r := e.Group("/graphql")
	r.Use(jwtAuthMiddleware)
	r.Any("", gqlController.GraphQLHandler)
	r.GET("/playground", gqlController.PlaygroundHandler)

	m := e.Group("/measurements")
	m.Use(kremiddleware.ChronografProxy(cfg.Chronograf.Address))

	d := e.Group("/database")
	d.Use(kremiddleware.MongoExpressProxy(cfg.MongoDB.MongoExpressAddress))

	return &App{
		e,
		cfg,
		logger,
	}
}

// Start runs the HTTP server.
func (a *App) Start() {
	a.logger.Info("HTTP server started on " + a.cfg.Admin.APIAddress)
	a.server.Logger.Fatal(a.server.Start(a.cfg.Admin.APIAddress))
}
