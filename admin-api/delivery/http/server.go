package http

import (
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"gitlab.com/konstellation/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/kre/admin-api/delivery/http/controller"
	kremiddleware "gitlab.com/konstellation/kre/admin-api/delivery/http/middleware"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
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
	authInteractor *usecase.AuthInteractor,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor *usecase.SettingInteractor,
	userActivityInteractor *usecase.UserActivityInteractor,
	versionInteractor *usecase.VersionInteractor,
	metricsInteractor *usecase.MetricsInteractor,
) *App {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	e.Validator = newCustomValidator()

	e.Use(
		middleware.RequestID(),
		middleware.LoggerWithConfig(middleware.LoggerConfig{
			Format: logFormat,
		}),
		kremiddleware.NewUserLoader(userInteractor),
		kremiddleware.NewVersionLoader(versionInteractor),
	)

	if cfg.Admin.CORSEnabled {
		e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins:     []string{cfg.Admin.FrontEndBaseURL},
			AllowCredentials: true,
		}))
	}

	authController := controller.NewAuthController(cfg, logger, authInteractor, settingInteractor)
	graphQLController := controller.NewGraphQLController(
		cfg,
		logger,
		runtimeInteractor,
		userInteractor,
		settingInteractor,
		userActivityInteractor,
		versionInteractor,
		metricsInteractor,
	)

	jwtMiddleware := middleware.JWTWithConfig(middleware.JWTConfig{
		SigningKey:  []byte(cfg.Auth.JWTSignSecret),
		TokenLookup: "cookie:token",
	})

	e.POST("/api/v1/auth/signin", authController.SignIn)
	e.POST("/api/v1/auth/signin/verify", authController.SignInVerify)
	e.POST("/api/v1/auth/logout", jwtMiddleware(authController.Logout))

	r := e.Group("/graphql")
	r.Use(jwtMiddleware)
	r.Any("", graphQLController.GraphQLHandler)
	r.GET("/playground", graphQLController.PlaygroundHandler)

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
