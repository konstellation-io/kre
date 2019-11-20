package controller

import (
	"context"
	"github.com/dgrijalva/jwt-go"
	"github.com/graph-gophers/graphql-go"
	"github.com/graph-gophers/graphql-go/relay"
	"github.com/labstack/echo"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

func strPtr(i string) *string { return &i }

func boolPtr(i bool) *bool { return &i }

type GraphQLController struct {
	cfg    *config.Config
	logger logging.Logger
}

func NewGraphQLController(cfg *config.Config, logger logging.Logger) *GraphQLController {
	return &GraphQLController{
		cfg,
		logger,
	}
}

type User struct {
	Id       graphql.ID
	Email    string
	Disabled *bool
}

type Version struct {
	Id             graphql.ID
	VersionNumber  string
	Description    *string
	Status         string
	CreationDate   string
	CreatorName    string
	ActivationDate string
	ActivatorName  string
}

type Runtime struct {
	Id           graphql.ID
	Name         string
	Status       string
	CreationDate string
	Versions     *[]*Version
}

type RuntimeUpdateResponse struct {
	Success bool
	Message *string
	Runtime *Runtime
}

type graphqlResolver struct{}

func (r *graphqlResolver) Me() *User {
	return &User{
		Id:       "12346",
		Email:    "john.doe@email.com",
		Disabled: boolPtr(false),
	}
}
func (r *graphqlResolver) AddRuntime(ctx context.Context, args struct{ Name string }) *RuntimeUpdateResponse {
	return &RuntimeUpdateResponse{
		Success: true,
		Message: strPtr("All done"),
		Runtime: &Runtime{
			Id:           "runtime.123",
			Name:         args.Name,
			Status:       "active",
			CreationDate: "today",
			Versions: &[]*Version{
				&Version{
					Id:             "version.123",
					VersionNumber:  "1.2.3",
					Description:    strPtr("The best version"),
					Status:         "active",
					CreationDate:   "today",
					CreatorName:    "john",
					ActivationDate: "today",
					ActivatorName:  "john",
				},
			},
		},
	}
}

func (g *GraphQLController) GraphQLHandler(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	g.logger.Info("Request from user " + userID)

	s := `
type Query {
  me: User
}

type Mutation {
   addRuntime(name: String!): RuntimeUpdateResponse!
}

type User {
  id: ID!
  email: String!
  disabled: Boolean
}

type Runtime {
 id: ID!
 name: String!
 status: String!
 creationDate: String!
 versions(status: String!): [Version]
}

type Version {
 id: ID!
 versionNumber: String!
 description: String
 status: String!
 creationDate: String!
 creatorName: String!
 activationDate: String!
 activatorName: String!
}

type RuntimeUpdateResponse {
 success: Boolean!
 message: String
 runtime: Runtime!
}
`

	opts := []graphql.SchemaOpt{graphql.UseFieldResolvers()}
	schema := graphql.MustParseSchema(s, &graphqlResolver{}, opts...)
	h := &relay.Handler{Schema: schema}

	h.ServeHTTP(c.Response(), c.Request())
	return nil
}
