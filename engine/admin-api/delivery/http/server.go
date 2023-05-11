package http

import (
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/controller"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/httperrors"
	kremiddleware "github.com/konstellation-io/kre/engine/admin-api/delivery/http/middleware"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
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
//

func NewApp(
	cfg *config.Config,
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	userActivityInteractor usecase.UserActivityInteracter,
	versionInteractor *usecase.VersionInteractor,
	metricsInteractor *usecase.MetricsInteractor,
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

	graphQLController := controller.NewGraphQLController(
		cfg,
		logger,
		runtimeInteractor,
		userInteractor,
		userActivityInteractor,
		versionInteractor,
		metricsInteractor,
	)

	middlewareErrorHandler := func(err error) error {
		logger.Errorf("Error looking for jwt token: %s", err)
		return httperrors.HTTPErrUnauthorized
	}

	skipIfHeaderPresent := func(existCondition bool) func(c echo.Context) bool {
		return func(c echo.Context) bool {
			auth := c.Request().Header.Get(echo.HeaderAuthorization)
			authExists := auth != ""

			return authExists == existCondition
		}
	}

	jwtCookieMiddleware := middleware.JWTWithConfig(middleware.JWTConfig{
		Skipper:      skipIfHeaderPresent(true),
		SigningKey:   []byte(cfg.Auth.JWTSignSecret),
		TokenLookup:  "cookie:token",
		ErrorHandler: middlewareErrorHandler,
	})

	jwtHeaderMiddleware := middleware.JWTWithConfig(middleware.JWTConfig{
		Skipper:      skipIfHeaderPresent(false),
		SigningKey:   []byte(cfg.Auth.JWTSignSecret),
		ErrorHandler: middlewareErrorHandler,
	})

	r := e.Group("/graphql")
	r.Use(jwtCookieMiddleware)
	r.Use(jwtHeaderMiddleware)
	r.Any("", graphQLController.GraphQLHandler)
	r.GET("/playground", graphQLController.PlaygroundHandler)

	m := e.Group("/measurements")
	m.Use(jwtCookieMiddleware)
	m.Use(kremiddleware.ChronografProxy(cfg.Chronograf.Address))

	d := e.Group("/database")
	d.Use(jwtCookieMiddleware)
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
