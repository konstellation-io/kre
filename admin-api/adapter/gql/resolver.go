package gql

import (
	"context"
	"github.com/graph-gophers/graphql-go"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"time"
)

type GraphQLResolver struct {
	logger            logging.Logger
	runtimeInteractor *usecase.RuntimeInteractor
	userInteractor    *usecase.UserInteractor
}

func NewGraphQLResolver(
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
) *GraphQLResolver {
	return &GraphQLResolver{
		logger,
		runtimeInteractor,
		userInteractor,
	}
}

func (r *GraphQLResolver) Me(ctx context.Context) *User {
	userID := ctx.Value("userID").(string)
	user, err := r.userInteractor.GetByID(userID)
	if err != nil {
		r.logger.Error("Error getting user " + userID + ": " + err.Error())
		return nil
	}

	disabled := new(bool)
	*disabled = false
	return &User{
		Id:       graphql.ID(userID),
		Email:    user.Email,
		Disabled: disabled,
	}
}
func (r *GraphQLResolver) CreateRuntime(ctx context.Context, args struct{ Name string }) *RuntimeUpdateResponse {
	userID := ctx.Value("userID").(string)

	runtime, err := r.runtimeInteractor.CreateRuntime(args.Name, userID)
	if err != nil {
		msg := new(string)
		*msg = "Error creating runtime: " + err.Error()
		return &RuntimeUpdateResponse{
			Success: false,
			Message: msg,
		}
	}

	msg := new(string)
	*msg = "Runtime created"

	return &RuntimeUpdateResponse{
		Success: true,
		Message: msg,
		Runtime: &Runtime{
			Id:           graphql.ID(runtime.ID),
			Name:         runtime.Name,
			Status:       "created",
			CreationDate: runtime.CreationDate.Format(time.RFC3339),
			Versions:     &[]*Version{},
		},
	}
}

func (r *GraphQLResolver) Runtimes(ctx context.Context) []*Runtime {
	var gqlRuntimes []*Runtime
	runtimes, err := r.runtimeInteractor.FindAll()

	if err != nil {
		return gqlRuntimes // TODO manage errors
	}

	for _, runtime := range runtimes {
		gqlRuntime := &Runtime{
			Id:           graphql.ID(runtime.ID),
			Name:         runtime.Name,
			Status:       "created",
			CreationDate: runtime.CreationDate.Format("2006-01-02"),
			Versions:     nil,
		}
		gqlRuntimes = append(gqlRuntimes, gqlRuntime)
	}

	return gqlRuntimes
}

func (r *GraphQLResolver) Dashboard(ctx context.Context) Dashboard {
	var gqlRuntimes []*Runtime
	runtimes, err := r.runtimeInteractor.FindAll()

	if err != nil {
		return Dashboard{
			Runtimes: &gqlRuntimes,
			Alerts:   &[]*Alert{},
		} // TODO manage errors
	}

	for _, runtime := range runtimes {
		gqlRuntime := &Runtime{
			Id:           graphql.ID(runtime.ID),
			Name:         runtime.Name,
			Status:       "created",
			CreationDate: runtime.CreationDate.Format("2006-01-02"),
			Versions:     nil,
		}
		gqlRuntimes = append(gqlRuntimes, gqlRuntime)
	}

	return Dashboard{
		Runtimes: &gqlRuntimes,
		Alerts:   &[]*Alert{},
	}
}
