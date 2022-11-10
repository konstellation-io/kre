package http

import (
	"log"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/controller"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/httperrors"
	kremiddleware "github.com/konstellation-io/kre/engine/admin-api/delivery/http/middleware"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	prometheusEcho "github.com/labstack/echo-contrib/prometheus"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	prometheusClient "github.com/prometheus/client_golang/prometheus"
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
	authInteractor usecase.AuthInteracter,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor usecase.SettingInteracter,
	userActivityInteractor usecase.UserActivityInteracter,
	versionInteractor *usecase.VersionInteractor,
	metricsInteractor *usecase.MetricsInteractor,
) *App {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	e.Validator = newCustomValidator()

	// Enable metrics middleware
	prometheusEcho := prometheusEcho.NewPrometheus("admin_api", kremiddleware.UrlSkipper)

	e.Static("/static", cfg.Admin.StoragePath)

	e.Use(
		middleware.RequestID(),
		middleware.LoggerWithConfig(middleware.LoggerConfig{
			Format: logFormat,
		}),
		kremiddleware.NewUserLoader(userInteractor),
	)

	if cfg.Admin.CORSEnabled {
		e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins:     []string{cfg.Admin.FrontEndBaseURL},
			AllowCredentials: true,
		}))
	}

	authController := controller.NewAuthController(
		cfg,
		logger,
		authInteractor,
		settingInteractor,
	)

	graphQLController := controller.NewGraphQLController(
		cfg,
		logger,
		runtimeInteractor,
		userInteractor,
		settingInteractor,
		userActivityInteractor,
		versionInteractor,
		metricsInteractor,
		authInteractor,
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

	sessionMiddleware := kremiddleware.NewSessionMiddleware(cfg, logger, authInteractor)

	graphQLMetricsMiddleware := kremiddleware.NewGraphQlMetricsMiddleware()

	e.POST("/api/v1/auth/signin", authController.SignIn)
	e.POST("/api/v1/auth/token/signin", authController.SignInWithAPIToken)
	e.POST("/api/v1/auth/signin/verify", authController.SignInVerify)
	e.POST("/api/v1/auth/logout", jwtCookieMiddleware(authController.Logout))

	r := e.Group("/graphql")
	r.Use(jwtCookieMiddleware)
	r.Use(jwtHeaderMiddleware)
	r.Use(sessionMiddleware)
	r.Use(graphQLMetricsMiddleware)
	r.Any("", graphQLController.GraphQLHandler)
	r.GET("/playground", graphQLController.PlaygroundHandler)

	m := e.Group("/measurements")
	m.Use(jwtCookieMiddleware)
	m.Use(sessionMiddleware)
	m.Use(kremiddleware.ChronografProxy(cfg.Chronograf.Address))

	d := e.Group("/database")
	d.Use(jwtCookieMiddleware)
	d.Use(sessionMiddleware)
	d.Use(kremiddleware.MongoExpressProxy(cfg.MongoDB.MongoExpressAddress))

	if err := prometheusClient.Register(kremiddleware.TotalRequestCounter); err != nil {
		log.Fatal("Error registering Prometheus metric: %v", err.Error())
	}

	prometheusEcho.Use(e)

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
