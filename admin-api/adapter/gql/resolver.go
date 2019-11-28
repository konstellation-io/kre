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
	settingInteractor *usecase.SettingInteractor
}

func NewGraphQLResolver(
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor *usecase.SettingInteractor,
) *GraphQLResolver {
	return &GraphQLResolver{
		logger,
		runtimeInteractor,
		userInteractor,
		settingInteractor,
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
	settings, err := r.settingInteractor.Get()
	if err != nil {
		return nil, err
	}

	hasChanges := false
	if input.SessionLifetimeInDays != nil && settings.SessionLifetimeInDays != *input.SessionLifetimeInDays {
		hasChanges = true
		settings.SessionLifetimeInDays = *input.SessionLifetimeInDays
	}

	if hasChanges {
		err = r.settingInteractor.Update(settings)
		if err != nil {
			return nil, err
		}
	}

	return &UpdateSettingsResponse{
		Errors: nil,
		Settings: &Settings{
			AuthAllowedDomains:    nil,
			SessionLifetimeInDays: settings.SessionLifetimeInDays,
		},
	}, nil
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
func (r *queryResolver) Versions(ctx context.Context, runtimeID string) ([]*Version, error) {
	panic("not implemented")
}
func (r *queryResolver) Alerts(ctx context.Context) ([]*Alert, error) {
	panic("not implemented")
}
func (r *queryResolver) Settings(ctx context.Context) (*Settings, error) {
	settings, err := r.settingInteractor.Get()
	if err != nil {
		return nil, err
	}

	return &Settings{
		AuthAllowedDomains:    nil,
		SessionLifetimeInDays: settings.SessionLifetimeInDays,
	}, nil
}
func (r *queryResolver) UsersActivity(ctx context.Context) ([]*UserActivity, error) {
	panic("not implemented")
}
func (r *queryResolver) Runtime(ctx context.Context, id string) (*Runtime, error) {
	panic("not implemented")
}
