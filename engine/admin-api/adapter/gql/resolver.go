package gql

//go:generate go run github.com/99designs/gqlgen --verbose

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/vektah/gqlparser/v2/gqlerror"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/dataloader"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/middleware"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

var versionStatusChannels map[string]chan *entity.Version
var runtimeCreatedChannels map[string]chan *entity.Runtime
var mux *sync.RWMutex

func init() {
	runtimeCreatedChannels = map[string]chan *entity.Runtime{}
	versionStatusChannels = map[string]chan *entity.Version{}
	mux = &sync.RWMutex{}
}

type Resolver struct {
	logger                 logging.Logger
	runtimeInteractor      *usecase.RuntimeInteractor
	userInteractor         *usecase.UserInteractor
	settingInteractor      usecase.SettingInteracter
	userActivityInteractor usecase.UserActivityInteracter
	versionInteractor      *usecase.VersionInteractor
	metricsInteractor      *usecase.MetricsInteractor
	authInteractor         usecase.AuthInteracter
	cfg                    *config.Config
}

func NewGraphQLResolver(
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor usecase.SettingInteracter,
	userActivityInteractor usecase.UserActivityInteracter,
	versionInteractor *usecase.VersionInteractor,
	metricsInteractor *usecase.MetricsInteractor,
	authInteractor usecase.AuthInteracter,
	cfg *config.Config,
) *Resolver {
	return &Resolver{
		logger,
		runtimeInteractor,
		userInteractor,
		settingInteractor,
		userActivityInteractor,
		versionInteractor,
		metricsInteractor,
		authInteractor,
		cfg,
	}
}

func (r *mutationResolver) CreateRuntime(ctx context.Context, input CreateRuntimeInput) (*entity.Runtime, error) {
	loggedUserID := ctx.Value("userID").(string)

	r.logger.Debug("Creating runtime with id " + input.ID)

	runtime, err := r.runtimeInteractor.CreateRuntime(ctx, loggedUserID, input.ID, input.Name, input.Description)
	if err != nil {
		r.logger.Error("Error creating runtime: " + err.Error())
		return nil, err
	}

	return runtime, nil
}

func (r *mutationResolver) CreateVersion(ctx context.Context, input CreateVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)

	version, notifyCh, err := r.versionInteractor.Create(ctx, loggedUserID, input.RuntimeID, input.File.File)
	if err != nil {
		if errs, ok := err.(validator.ValidationErrors); ok {
			details := "The krt.yml file contains the following validation errors:"
			hasResNameErr := false

			for _, e := range errs {
				location := strings.Replace(e.Namespace(), "Krt.", "", 1)
				switch e.Tag() {
				case "required":
					details += fmt.Sprintf("\n  - The field \"%s\" is required", location)
				case "lt":
					details += fmt.Sprintf("\n  - Invalid length \"%s\" at \"%s\" must be lower than %s", e.Value(), location, e.Param())
				case "lte":
					details += fmt.Sprintf("\n  - Invalid length \"%s\" at \"%s\" must be lower or equal than %s", e.Value(), location, e.Param())
				case "gt":
					details += fmt.Sprintf("\n  - Invalid length \"%s\" at \"%s\" must be greater than %s", e.Value(), location, e.Param())
				case "gte":
					details += fmt.Sprintf("\n  - Invalid length \"%s\" at \"%s\" must be greater or equal than %s", e.Value(), location, e.Param())
				case "resource-name":
					details += fmt.Sprintf("\n  - Invalid resource name \"%s\" at \"%s\"", e.Value(), location)
					hasResNameErr = true
				default:
					details += fmt.Sprintf("\n  - %s", e)
				}
			}

			if hasResNameErr {
				details += "\nThe resource names must contain only lowercase alphanumeric characters or '-', e.g. my-resource-name."
			}

			extensions := make(map[string]interface{})
			extensions["code"] = "krt_validation_error"
			extensions["details"] = details
			return nil, &gqlerror.Error{
				Message:    "the krt.yml file contains errors",
				Extensions: extensions,
			}
		}

		return nil, err
	}

	go r.notifyVersionStatus(notifyCh)

	return version, nil
}

func (r *mutationResolver) StartVersion(ctx context.Context, input StartVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)

	v, notifyCh, err := r.versionInteractor.Start(ctx, loggedUserID, input.RuntimeID, input.VersionName, input.Comment)
	if err != nil {
		return nil, err
	}

	go r.notifyVersionStatus(notifyCh)

	return v, err
}

func (r *mutationResolver) StopVersion(ctx context.Context, input StopVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)

	v, notifyCh, err := r.versionInteractor.Stop(ctx, loggedUserID, input.RuntimeID, input.VersionName, input.Comment)
	if err != nil {
		return nil, err
	}

	go r.notifyVersionStatus(notifyCh)

	return v, err
}

func (r *mutationResolver) notifyVersionStatus(notifyCh chan *entity.Version) {
	for {
		select {
		case v, ok := <-notifyCh:
			if !ok {
				r.logger.Debugf("[notifyVersionStatus] received nil on notifyCh. closing notifier")
				return
			}

			mux.RLock()
			for _, vs := range versionStatusChannels {
				vs <- v
			}
			mux.RUnlock()
		}
	}
}

func (r *mutationResolver) UnpublishVersion(ctx context.Context, input UnpublishVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.Unpublish(ctx, loggedUserID, input.RuntimeID, input.VersionName, input.Comment)
}

func (r *mutationResolver) PublishVersion(ctx context.Context, input PublishVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.Publish(ctx, loggedUserID, input.RuntimeID, input.VersionName, input.Comment)
}

func (r *mutationResolver) UpdateSettings(ctx context.Context, input SettingsInput) (*entity.Settings, error) {
	loggedUserID := ctx.Value("userID").(string)
	settings, err := r.settingInteractor.Get(ctx, loggedUserID)
	if err != nil {
		return nil, err
	}

	var changes []entity.UserActivity
	if input.SessionLifetimeInDays != nil && settings.SessionLifetimeInDays != *input.SessionLifetimeInDays {
		changes = append(changes, entity.UserActivity{
			UserID: loggedUserID,
			Vars: r.userActivityInteractor.NewUpdateSettingVars(
				"SessionLifetimeInDays",
				strconv.Itoa(settings.SessionLifetimeInDays),
				strconv.Itoa(*input.SessionLifetimeInDays)),
		})
		settings.SessionLifetimeInDays = *input.SessionLifetimeInDays
	}

	if input.AuthAllowedDomains != nil {
		changes = append(changes, entity.UserActivity{
			UserID: loggedUserID,
			Vars: r.userActivityInteractor.NewUpdateSettingVars(
				"AuthAllowedDomains",
				strings.Join(settings.AuthAllowedDomains, ","),
				strings.Join(input.AuthAllowedDomains, ",")),
		})
		settings.AuthAllowedDomains = input.AuthAllowedDomains
	}

	if len(changes) > 0 {
		err = r.settingInteractor.Update(loggedUserID, settings, changes)
		if err != nil {
			return nil, err
		}
	}

	return settings, nil
}

func (r *mutationResolver) UpdateVersionConfiguration(ctx context.Context, input UpdateConfigurationInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	v, err := r.versionInteractor.GetByName(ctx, loggedUserID, input.RuntimeID, input.VersionName)
	if err != nil {
		return nil, err
	}

	config := make([]*entity.ConfigurationVariable, len(input.ConfigurationVariables))

	for i, c := range input.ConfigurationVariables {
		config[i] = &entity.ConfigurationVariable{
			Key:   c.Key,
			Value: c.Value,
		}
	}

	return r.versionInteractor.UpdateVersionConfig(ctx, loggedUserID, v, config)
}

func (r *mutationResolver) RemoveUsers(ctx context.Context, input UsersInput) ([]*entity.User, error) {
	loggedUserID := ctx.Value("userID").(string)
	for _, id := range input.UserIds {
		if id == loggedUserID {
			return nil, errors.New("you cannot remove yourself")
		}
	}

	return r.userInteractor.RemoveUsers(ctx, input.UserIds, loggedUserID, input.Comment)
}

func (r *mutationResolver) UpdateAccessLevel(ctx context.Context, input UpdateAccessLevelInput) ([]*entity.User, error) {
	loggedUserID := ctx.Value("userID").(string)
	for _, id := range input.UserIds {
		if id == loggedUserID {
			return nil, errors.New("you cannot change your access level")
		}
	}

	return r.userInteractor.UpdateAccessLevel(ctx, input.UserIds, input.AccessLevel, loggedUserID, input.Comment)
}

func (r *mutationResolver) RevokeUserSessions(ctx context.Context, input UsersInput) ([]*entity.User, error) {
	loggedUserID := ctx.Value("userID").(string)

	users, err := r.userInteractor.GetByIDs(input.UserIds)
	if err != nil {
		return nil, err
	}

	err = r.authInteractor.RevokeUserSessions(input.UserIds, loggedUserID, input.Comment)
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (r *mutationResolver) CreateUser(ctx context.Context, input CreateUserInput) (*entity.User, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.userInteractor.Create(ctx, input.Email, input.AccessLevel, loggedUserID)
}

func (r *mutationResolver) DeleteAPIToken(ctx context.Context, input DeleteAPITokenInput) (*entity.APIToken, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.userInteractor.DeleteAPIToken(ctx, input.ID, loggedUserID)
}

func (r *mutationResolver) GenerateAPIToken(ctx context.Context, input GenerateAPITokenInput) (string, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.userInteractor.GenerateAPIToken(ctx, input.Name, loggedUserID)
}

func (r *queryResolver) Me(ctx context.Context) (*entity.User, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.userInteractor.GetByID(loggedUserID)
}

func (r *queryResolver) Metrics(ctx context.Context, runtimeId, versionName, startDate, endDate string) (*entity.Metrics, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.metricsInteractor.GetMetrics(ctx, loggedUserID, runtimeId, versionName, startDate, endDate)
}

func (r *queryResolver) Users(ctx context.Context) ([]*entity.User, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.userInteractor.GetAllUsers(ctx, loggedUserID, false)
}

func (r *queryResolver) Runtime(ctx context.Context, id string) (*entity.Runtime, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.runtimeInteractor.GetByID(ctx, loggedUserID, id)
}

func (r *queryResolver) Runtimes(ctx context.Context) ([]*entity.Runtime, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.runtimeInteractor.FindAll(ctx, loggedUserID)
}

func (r *queryResolver) Version(ctx context.Context, name, runtimeId string) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.GetByName(ctx, loggedUserID, runtimeId, name)
}

func (r *queryResolver) Versions(ctx context.Context, runtimeId string) ([]*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.GetByRuntime(loggedUserID, runtimeId)
}

func (r *queryResolver) Settings(ctx context.Context) (*entity.Settings, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.settingInteractor.Get(ctx, loggedUserID)
}

func (r *queryResolver) UserActivityList(
	ctx context.Context,
	userEmail *string,
	types []entity.UserActivityType,
	versionIds []string,
	fromDate *string,
	toDate *string,
	lastID *string,
) ([]*entity.UserActivity, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.userActivityInteractor.Get(ctx, loggedUserID, userEmail, types, versionIds, fromDate, toDate, lastID)
}

func (r *queryResolver) Logs(
	ctx context.Context,
	versionName string,
	filters entity.LogFilters,
	cursor *string,
) (*LogPage, error) {
	loggedUserID := ctx.Value("userID").(string)

	searchResult, err := r.versionInteractor.SearchLogs(ctx, loggedUserID, filters, cursor)
	if err != nil {
		return nil, err
	}

	nextCursor := new(string)
	if searchResult.Cursor != "" {
		*nextCursor = searchResult.Cursor
	}

	return &LogPage{
		Cursor: nextCursor,
		Items:  searchResult.Logs,
	}, nil
}

func (r *runtimeResolver) CreationAuthor(ctx context.Context, runtime *entity.Runtime) (*entity.User, error) {
	userLoader := ctx.Value(middleware.UserLoaderKey).(*dataloader.UserLoader)
	return userLoader.Load(runtime.Owner)
}

func (r *runtimeResolver) CreationDate(_ context.Context, obj *entity.Runtime) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *runtimeResolver) PublishedVersion(ctx context.Context, obj *entity.Runtime) (*entity.Version, error) {
	if obj.PublishedVersion != "" {
		versionLoader := ctx.Value(middleware.VersionLoaderKey).(*dataloader.VersionLoader)
		return versionLoader.Load(obj.PublishedVersion)
	}
	return nil, nil
}

func (r *runtimeResolver) MeasurementsURL(_ context.Context, obj *entity.Runtime) (string, error) {
	return fmt.Sprintf("%s/measurements/%s", r.cfg.Admin.BaseURL, r.cfg.K8s.Namespace), nil
}

func (r *runtimeResolver) DatabaseURL(_ context.Context, obj *entity.Runtime) (string, error) {
	return fmt.Sprintf("%s/database/%s", r.cfg.Admin.BaseURL, r.cfg.K8s.Namespace), nil
}

func (r *runtimeResolver) EntrypointAddress(_ context.Context, obj *entity.Runtime) (string, error) {
	return fmt.Sprintf("entrypoint.%s", r.cfg.BaseDomainName), nil
}

func (r *subscriptionResolver) WatchVersion(ctx context.Context) (<-chan *entity.Version, error) {
	id := uuid.New().String()

	versionStatusCh := make(chan *entity.Version, 1)
	go func() {
		<-ctx.Done()
		mux.Lock()
		delete(versionStatusChannels, id)
		mux.Unlock()
	}()

	mux.Lock()
	versionStatusChannels[id] = versionStatusCh
	mux.Unlock()

	return versionStatusCh, nil
}

func (r *subscriptionResolver) WatchNodeStatus(ctx context.Context, versionName, runtimeID string) (<-chan *entity.Node, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.WatchNodeStatus(ctx, loggedUserID, runtimeID, versionName)
}

func (r *subscriptionResolver) WatchNodeLogs(ctx context.Context, versionName string, filters entity.LogFilters) (<-chan *entity.NodeLog, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.WatchNodeLogs(ctx, loggedUserID, versionName, filters)
}

func (r *userActivityResolver) Date(_ context.Context, obj *entity.UserActivity) (string, error) {
	return obj.Date.Format(time.RFC3339), nil
}

func (r *userActivityResolver) User(ctx context.Context, obj *entity.UserActivity) (*entity.User, error) {
	userLoader := ctx.Value(middleware.UserLoaderKey).(*dataloader.UserLoader)
	return userLoader.Load(obj.UserID)
}

func (r *userResolver) APITokens(ctx context.Context, obj *entity.User) ([]*entity.APIToken, error) {
	return r.userInteractor.GetTokensByUserID(ctx, obj.ID)
}

func (r *userResolver) LastActivity(_ context.Context, obj *entity.User) (*string, error) {
	if obj.LastActivity == nil {
		return nil, nil
	}

	date := obj.LastActivity.Format(time.RFC3339)
	return &date, nil
}

func (r *userResolver) CreationDate(_ context.Context, obj *entity.User) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *userResolver) ActiveSessions(ctx context.Context, obj *entity.User) (int, error) {
	return r.authInteractor.CountUserSessions(ctx, obj.ID)
}

func (a apiTokenResolver) CreationDate(ctx context.Context, obj *entity.APIToken) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (a apiTokenResolver) LastActivity(ctx context.Context, obj *entity.APIToken) (*string, error) {
	if obj.LastActivity == nil {
		return nil, nil
	}

	date := obj.LastActivity.Format(time.RFC3339)
	return &date, nil
}

func (r *versionResolver) CreationDate(_ context.Context, obj *entity.Version) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *versionResolver) CreationAuthor(ctx context.Context, obj *entity.Version) (*entity.User, error) {
	userLoader := ctx.Value(middleware.UserLoaderKey).(*dataloader.UserLoader)
	return userLoader.Load(obj.CreationAuthor)
}

func (r *versionResolver) PublicationDate(_ context.Context, obj *entity.Version) (*string, error) {
	if obj.PublicationDate == nil {
		return nil, nil
	}
	result := obj.PublicationDate.Format(time.RFC3339)
	return &result, nil
}

func (r *versionResolver) PublicationAuthor(ctx context.Context, obj *entity.Version) (*entity.User, error) {
	if obj.PublicationUserID == nil {
		return nil, nil
	}

	userLoader := ctx.Value(middleware.UserLoaderKey).(*dataloader.UserLoader)
	return userLoader.Load(*obj.PublicationUserID)
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

// Runtime returns RuntimeResolver implementation.
func (r *Resolver) Runtime() RuntimeResolver { return &runtimeResolver{r} }

// Subscription returns SubscriptionResolver implementation.
func (r *Resolver) Subscription() SubscriptionResolver { return &subscriptionResolver{r} }

// User returns UserResolver implementation.
func (r *Resolver) User() UserResolver { return &userResolver{r} }

// ApiToken returns APITokenResolver implementation.
func (r *Resolver) ApiToken() ApiTokenResolver { return &apiTokenResolver{r} }

// UserActivity returns UserActivityResolver implementation.
func (r *Resolver) UserActivity() UserActivityResolver { return &userActivityResolver{r} }

// Version returns VersionResolver implementation.
func (r *Resolver) Version() VersionResolver { return &versionResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type runtimeResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
type userActivityResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
type apiTokenResolver struct{ *Resolver }
type versionResolver struct{ *Resolver }
