package controller

import (
	"context"

	"github.com/99designs/gqlgen/handler"
	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/gql"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

type GraphQLController struct {
	cfg               *config.Config
	logger            logging.Logger
	runtimeInteractor *usecase.RuntimeInteractor
	userInteractor    *usecase.UserInteractor
	settingInteractor *usecase.SettingInteractor
}

func NewGraphQLController(
	cfg *config.Config,
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor *usecase.SettingInteractor,
) *GraphQLController {
	return &GraphQLController{
		cfg,
		logger,
		runtimeInteractor,
		userInteractor,
		settingInteractor,
	}
}

func (g *GraphQLController) GraphQLHandler(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	g.logger.Info("Request from user " + userID)

	h := gql.NewHttpHandler(g.logger, g.runtimeInteractor, g.userInteractor, g.settingInteractor)

	r := c.Request()
	ctx := context.WithValue(r.Context(), "userID", userID)

	h.ServeHTTP(c.Response(), r.WithContext(ctx))

	return nil
}

func (g *GraphQLController) PlaygroundHandler(c echo.Context) error {
	h := handler.Playground("GraphQL playground", "/graphql")
	h.ServeHTTP(c.Response(), c.Request())
	return nil
}
