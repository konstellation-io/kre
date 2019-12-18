package gql

import (
	"context"
	"github.com/google/uuid"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"time"
)

var runtimeCreatedChannels map[string]chan *Runtime

func init() {
	runtimeCreatedChannels = map[string]chan *Runtime{}
}

type GraphQLResolver struct {
	logger                 logging.Logger
	runtimeInteractor      *usecase.RuntimeInteractor
	userInteractor         *usecase.UserInteractor
	settingInteractor      *usecase.SettingInteractor
	userActivityInteractor *usecase.UserActivityInteractor
	versionInteractor      *usecase.VersionInteractor
}

func NewGraphQLResolver(
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor *usecase.SettingInteractor,
	userActivityInteractor *usecase.UserActivityInteractor,
	versionInteractor *usecase.VersionInteractor,
) *GraphQLResolver {
	return &GraphQLResolver{
		logger:                 logger,
		runtimeInteractor:      runtimeInteractor,
		userInteractor:         userInteractor,
		settingInteractor:      settingInteractor,
		userActivityInteractor: userActivityInteractor,
		versionInteractor:      versionInteractor,
	}
}

func (r *GraphQLResolver) Mutation() MutationResolver {
	return &mutationResolver{r}
}
func (r *GraphQLResolver) Query() QueryResolver {
	return &queryResolver{r}
}
func (r *GraphQLResolver) Subscription() SubscriptionResolver {
	return &subscriptionResolver{r}
}

type mutationResolver struct{ *GraphQLResolver }

func (r *mutationResolver) CreateRuntime(ctx context.Context, input CreateRuntimeInput) (*CreateRuntimeResponse, error) {
	userID := ctx.Value("userID").(string)

	owner, err := r.userInteractor.GetByID(userID)
	if err != nil {
		return nil, err
	}

	runtime, onRuntimeRunningChannel, err := r.runtimeInteractor.CreateRuntime(input.Name, userID)

	go func() {
		runtime := <-onRuntimeRunningChannel

		for _, r := range runtimeCreatedChannels {
			r <- toGQLRuntime(runtime, owner)
		}
	}()

	if err != nil {
		r.logger.Error("Error creating runtime: " + err.Error())
		return nil, err
	}

	return &CreateRuntimeResponse{
		Errors:  nil,
		Runtime: toGQLRuntime(runtime, owner),
	}, nil
}
func (r *mutationResolver) CreateVersion(ctx context.Context, input CreateVersionInput) (*CreateVersionResponse, error) {
	userID := ctx.Value("userID").(string)
	author, err := r.userInteractor.GetByID(userID)
	if err != nil {
		return nil, err
	}

	version, err := r.versionInteractor.Create(userID, input.RuntimeID, input.File.File)
	if err != nil {
		return nil, err
	}

	return &CreateVersionResponse{
		Errors:  nil,
		Version: toGQLVersion(version, author, nil),
	}, nil
}
func (r *mutationResolver) DeployVersion(ctx context.Context, input DeployVersionInput) (*Version, error) {
	userID := ctx.Value("userID").(string)

	version, err := r.versionInteractor.Deploy(userID, input.VersionID)
	if err != nil {
		return nil, err
	}

	creationUser, err := r.userInteractor.GetByID(version.CreationAuthor)
	if err != nil {
		return nil, err
	}

	return toGQLVersion(version, creationUser, nil), nil
}
func (r *mutationResolver) ActivateVersion(ctx context.Context, input ActivateVersionInput) (*Version, error) {
	userID := ctx.Value("userID").(string)

	version, err := r.versionInteractor.Activate(userID, input.VersionID)
	if err != nil {
		return nil, err
	}

	creationUser, err := r.userInteractor.GetByID(version.CreationAuthor)
	if err != nil {
		return nil, err
	}

	activationUser, err := r.userInteractor.GetByID(userID)
	if err != nil {
		return nil, err
	}

	return toGQLVersion(version, creationUser, activationUser), nil
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

	if input.AuthAllowedDomains != nil {
		hasChanges = true
		settings.AuthAllowedDomains = input.AuthAllowedDomains
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
			AuthAllowedDomains:    settings.AuthAllowedDomains,
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
			Status:       RuntimeStatus(runtime.Status),
			CreationDate: runtime.CreationDate.Format("2006-01-02"),
			Versions:     []*Version{},
		}
		gqlRuntimes = append(gqlRuntimes, gqlRuntime)
	}

	return gqlRuntimes, nil
}
func (r *queryResolver) Versions(ctx context.Context, runtimeID string) ([]*Version, error) {
	versions, err := r.versionInteractor.GetAll()
	if err != nil {
		return nil, err
	}

	var gqlVersions []*Version
	for _, v := range versions {
		creationUser, err := r.userInteractor.GetByID(v.CreationAuthor) // TODO improve this using something like https://gqlgen.com/reference/dataloaders/
		if err != nil && err != usecase.ErrUserNotFound {
			return nil, err
		}
		activationUser, err := r.userInteractor.GetByID(v.ActivationUserID)
		if err != nil && err != usecase.ErrUserNotFound {
			return nil, err
		}
		gqlVersion := toGQLVersion(&v, creationUser, activationUser)
		gqlVersions = append(gqlVersions, gqlVersion)
	}

	return gqlVersions, nil
}
func (r *queryResolver) Alerts(ctx context.Context) ([]*Alert, error) {
	return []*Alert{}, nil
}
func (r *queryResolver) Settings(ctx context.Context) (*Settings, error) {
	settings, err := r.settingInteractor.Get()
	if err != nil {
		return nil, err
	}

	return &Settings{
		AuthAllowedDomains:    settings.AuthAllowedDomains,
		SessionLifetimeInDays: settings.SessionLifetimeInDays,
	}, nil
}
func (r *queryResolver) UserActivityList(ctx context.Context, userMail *string, typeArg *UserActivityType, fromDate *string, toDate *string) ([]*UserActivity, error) {
	activityType := new(string)
	if typeArg != nil {
		*activityType = typeArg.String()
	} else {
		activityType = nil
	}

	activities, err := r.userActivityInteractor.Get(userMail, activityType, fromDate, toDate)
	if err != nil {
		return nil, err
	}

	var result []*UserActivity
	for _, a := range activities {
		result = append(result, &UserActivity{
			ID: a.ID,
			User: &User{
				ID:    a.User.ID,
				Email: a.User.Email,
			},
			Message: a.Message,
			Date:    a.Date.Format(time.RFC3339),
			Type:    UserActivityType(a.Type),
		})
	}

	return result, nil
}
func (r *queryResolver) Runtime(ctx context.Context, id string) (*Runtime, error) {
	runtime, err := r.runtimeInteractor.GetByID(id)
	if err != nil {
		return nil, err
	}

	owner, err := r.userInteractor.GetByID(runtime.Owner)
	if err != nil {
		return nil, err
	}

	return toGQLRuntime(runtime, owner), nil
}

type subscriptionResolver struct{ *GraphQLResolver }

func (r *subscriptionResolver) RuntimeCreated(ctx context.Context) (<-chan *Runtime, error) {
	id := uuid.New().String()

	runtimeCreatedChan := make(chan *Runtime, 1)
	go func() {
		<-ctx.Done()
		delete(runtimeCreatedChannels, id)
	}()

	runtimeCreatedChannels[id] = runtimeCreatedChan

	return runtimeCreatedChan, nil
}
