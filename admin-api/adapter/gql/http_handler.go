package gql

import (
	"net/http"
	"time"

	"github.com/99designs/gqlgen/handler"
	"github.com/gorilla/websocket"

	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
)

func NewHttpHandler(
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor *usecase.SettingInteractor,
	userActivityInteractor *usecase.UserActivityInteractor,
	versionInteractor *usecase.VersionInteractor,
) http.Handler {
	graphQLResolver := NewGraphQLResolver(
		logger,
		runtimeInteractor,
		userInteractor,
		settingInteractor,
		userActivityInteractor,
		versionInteractor,
	)

	var mb int64 = 1 << 20

	h := handler.GraphQL(
		NewExecutableSchema(Config{Resolvers: graphQLResolver}),
		handler.WebsocketKeepAliveDuration(10*time.Second),
		handler.WebsocketUpgrader(websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		}),
		handler.UploadMaxMemory(500*mb),
		handler.UploadMaxSize(500*mb),
	)

	return h
}

func NewPlaygroundHandler() http.HandlerFunc {
	return handler.Playground("GraphQL playground", "/graphql")
}
