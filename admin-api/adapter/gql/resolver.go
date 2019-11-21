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
			Status:       "CREATED", // TODO define runtime status
			CreationDate: runtime.CreationDate.Format(time.RFC3339),
			Versions:     &[]*Version{},
		},
	}
}
