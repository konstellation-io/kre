package gql

import (
	"github.com/graph-gophers/graphql-go"
	"github.com/graph-gophers/graphql-go/relay"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"net/http"
)

func NewHttpHandler(
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
) http.Handler {
	graphQLResolver := NewGraphQLResolver(logger, runtimeInteractor, userInteractor)

	opts := []graphql.SchemaOpt{graphql.UseFieldResolvers()}
	schema := graphql.MustParseSchema(GraphQLSchema, graphQLResolver, opts...)
	h := &relay.Handler{Schema: schema}

	return h
}
