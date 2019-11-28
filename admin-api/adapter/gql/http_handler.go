package gql

import (
	"github.com/99designs/gqlgen/handler"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"net/http"
)

func NewHttpHandler(
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor *usecase.SettingInteractor,
) http.Handler {
	graphQLResolver := NewGraphQLResolver(logger, runtimeInteractor, userInteractor, settingInteractor)

	h := handler.GraphQL(NewExecutableSchema(Config{Resolvers: graphQLResolver}))
	return h
}

func NewPlaygroundHandler() http.HandlerFunc {
	return handler.Playground("GraphQL playground", "/graphql")
}
