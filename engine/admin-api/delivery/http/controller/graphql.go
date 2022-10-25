package controller

import (
	"context"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/gql"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

const UserIDContextKey = "userID"

type GraphQLController struct {
	cfg                    *config.Config
	logger                 logging.Logger
	runtimeInteractor      *usecase.RuntimeInteractor
	userInteractor         *usecase.UserInteractor
	settingInteractor      usecase.SettingInteracter
	userActivityInteractor usecase.UserActivityInteracter
	versionInteractor      *usecase.VersionInteractor
	metricsInteractor      *usecase.MetricsInteractor
	authInteractor         usecase.AuthInteracter
}

func NewGraphQLController(
	cfg *config.Config,
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor usecase.SettingInteracter,
	userActivityInteractor usecase.UserActivityInteracter,
	versionInteractor *usecase.VersionInteractor,
	metricsInteractor *usecase.MetricsInteractor,
	authInteractor usecase.AuthInteracter,
) *GraphQLController {
	return &GraphQLController{
		cfg,
		logger,
		runtimeInteractor,
		userInteractor,
		settingInteractor,
		userActivityInteractor,
		versionInteractor,
		metricsInteractor,
		authInteractor,
	}
}

func (g *GraphQLController) GraphQLHandler(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	g.logger.Info("Request from user " + userID)

	h := gql.NewHttpHandler(
		g.logger,
		g.runtimeInteractor,
		g.userInteractor,
		g.settingInteractor,
		g.userActivityInteractor,
		g.versionInteractor,
		g.metricsInteractor,
		g.authInteractor,
		g.cfg,
	)

	r := c.Request()
	ctx := context.WithValue(r.Context(), UserIDContextKey, userID)

	h.ServeHTTP(c.Response(), r.WithContext(ctx))

	return nil
}

func (g *GraphQLController) PlaygroundHandler(c echo.Context) error {
	h := playground.Handler("GraphQL playground", "/graphql")
	h.ServeHTTP(c.Response(), c.Request())
	return nil
}
