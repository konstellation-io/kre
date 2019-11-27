package gql

import (
	"context"
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

func (r *GraphQLResolver) Mutation() MutationResolver {
	return &mutationResolver{r}
}
func (r *GraphQLResolver) Query() QueryResolver {
	return &queryResolver{r}
}

type mutationResolver struct{ *GraphQLResolver }

func (r *mutationResolver) CreateRuntime(ctx context.Context, input CreateRuntimeInput) (*CreateRuntimeResponse, error) {
	userID := ctx.Value("userID").(string)

	runtime, err := r.runtimeInteractor.CreateRuntime(input.Name, userID)
	if err != nil {
		r.logger.Error("Error creating runtime: " + err.Error())
		return nil, err
	}

	return &CreateRuntimeResponse{
		Errors: nil,
		Runtime: &Runtime{
			ID:             runtime.ID,
			Name:           runtime.Name,
			Status:         RuntimeStatusCreating,
			CreationDate:   runtime.CreationDate.Format(time.RFC3339),
			CreationAuthor: nil,
			Versions:       []*Version{},
		},
	}, nil
}
func (r *mutationResolver) CreateVersion(ctx context.Context, input CreateVersionInput) (*CreateVersionResponse, error) {
	panic("not implemented")
}
func (r *mutationResolver) UpdateSettings(ctx context.Context, input SettingsInput) (*UpdateSettingsResponse, error) {
	panic("not implemented")
}

type queryResolver struct{ *GraphQLResolver }

func (r *queryResolver) Me(ctx context.Context) (*User, error) {
	userID := ctx.Value("userID").(string)
	user, err := r.userInteractor.GetByID(userID)
	if err != nil {
		r.logger.Error("Error getting user " + userID + ": " + err.Error())
		return nil, err
	}

	return &User{
		ID:    userID,
		Email: user.Email,
	}, nil
}
func (r *queryResolver) Runtimes(ctx context.Context) ([]*Runtime, error) {
	var gqlRuntimes []*Runtime
	runtimes, err := r.runtimeInteractor.FindAll()

	if err != nil {
		r.logger.Error("Error getting runtimes: " + err.Error())
		return gqlRuntimes, err
	}

	for _, runtime := range runtimes {
		gqlRuntime := &Runtime{
			ID:           runtime.ID,
			Name:         runtime.Name,
			Status:       RuntimeStatusCreating,
			CreationDate: runtime.CreationDate.Format("2006-01-02"),
			Versions:     []*Version{},
		}
		gqlRuntimes = append(gqlRuntimes, gqlRuntime)
	}

	return gqlRuntimes, nil
}
func (r *queryResolver) Alerts(ctx context.Context) ([]*Alert, error) {
	panic("not implemented")
}
func (r *queryResolver) Settings(ctx context.Context) (*Settings, error) {
	panic("not implemented")
}
func (r *queryResolver) UsersActivity(ctx context.Context) ([]*UserActivity, error) {
	panic("not implemented")
}
func (r *queryResolver) Runtime(ctx context.Context, id string) (*Runtime, error) {
	panic("not implemented")
}
