package gql

import (
	"net/http"
	"time"

	"github.com/99designs/gqlgen/handler"
	"github.com/gorilla/websocket"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

func NewHttpHandler(
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor *usecase.SettingInteractor,
	userActivityInteractor *usecase.UserActivityInteractor,
) http.Handler {
	graphQLResolver := NewGraphQLResolver(
		logger,
		runtimeInteractor,
		userInteractor,
		settingInteractor,
		userActivityInteractor,
	)

	h := handler.GraphQL(
		NewExecutableSchema(Config{Resolvers: graphQLResolver}),
		handler.WebsocketKeepAliveDuration(10*time.Second),
		handler.WebsocketUpgrader(websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		}),
	)

	return h
}

func NewPlaygroundHandler() http.HandlerFunc {
	return handler.Playground("GraphQL playground", "/graphql")
}
