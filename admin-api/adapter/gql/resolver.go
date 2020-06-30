package gql

//go:generate go run github.com/99designs/gqlgen --verbose

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/konstellation-io/kre/admin-api/adapter/dataloader"
	"github.com/konstellation-io/kre/admin-api/delivery/http/middleware"
	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
)

var runtimeCreatedChannels map[string]chan *entity.Runtime

func init() {
	runtimeCreatedChannels = map[string]chan *entity.Runtime{}
}

type Resolver struct {
	logger                    logging.Logger
	runtimeInteractor         *usecase.RuntimeInteractor
	userInteractor            *usecase.UserInteractor
	settingInteractor         *usecase.SettingInteractor
	userActivityInteractor    *usecase.UserActivityInteractor
	versionInteractor         *usecase.VersionInteractor
	metricsInteractor         *usecase.MetricsInteractor
	authInteractor            *usecase.AuthInteractor
	resourceMetricsInteractor *usecase.ResourceMetricsInteractor
}

func NewGraphQLResolver(
	logger logging.Logger,
	runtimeInteractor *usecase.RuntimeInteractor,
	userInteractor *usecase.UserInteractor,
	settingInteractor *usecase.SettingInteractor,
	userActivityInteractor *usecase.UserActivityInteractor,
	versionInteractor *usecase.VersionInteractor,
	metricsInteractor *usecase.MetricsInteractor,
	authInteractor *usecase.AuthInteractor,
	resourceMetricsInteractor *usecase.ResourceMetricsInteractor,
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
		resourceMetricsInteractor,
	}
}

func (r *mutationResolver) CreateRuntime(ctx context.Context, input CreateRuntimeInput) (*entity.Runtime, error) {
	loggedUserID := ctx.Value("userID").(string)
	runtime, onRuntimeStartedChannel, err := r.runtimeInteractor.CreateRuntime(ctx, loggedUserID, input.Name, input.Description)

	go func() {
		runtime := <-onRuntimeStartedChannel

		for _, r := range runtimeCreatedChannels {
			r <- runtime
		}
	}()

	if err != nil {
		r.logger.Error("Error creating runtime: " + err.Error())
		return nil, err
	}

	return runtime, nil
}

func (r *mutationResolver) CreateVersion(ctx context.Context, input CreateVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	version, err := r.versionInteractor.Create(ctx, loggedUserID, input.RuntimeID, input.File.File)
	if err != nil {
		return nil, err
	}

	return version, nil
}

func (r *mutationResolver) StartVersion(ctx context.Context, input StartVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.Start(ctx, loggedUserID, input.VersionID, input.Comment)
}

func (r *mutationResolver) StopVersion(ctx context.Context, input StopVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.Stop(ctx, loggedUserID, input.VersionID, input.Comment)
}

func (r *mutationResolver) UnpublishVersion(ctx context.Context, input UnpublishVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.Unpublish(ctx, loggedUserID, input.VersionID, input.Comment)
}

func (r *mutationResolver) PublishVersion(ctx context.Context, input PublishVersionInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.Publish(ctx, loggedUserID, input.VersionID, input.Comment)
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
	v, err := r.versionInteractor.GetByID(loggedUserID, input.VersionID)
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

func (r *queryResolver) Me(ctx context.Context) (*entity.User, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.userInteractor.GetByID(loggedUserID)
}

func (r *queryResolver) Metrics(ctx context.Context, runtimeID string, versionID string, startDate string, endDate string) (*entity.Metrics, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.metricsInteractor.GetMetrics(ctx, loggedUserID, runtimeID, versionID, startDate, endDate)
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

func (r *queryResolver) Version(ctx context.Context, id string) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.GetByID(loggedUserID, id)
}

func (r *queryResolver) Versions(ctx context.Context, runtimeID string) ([]*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.GetByRuntime(loggedUserID, runtimeID)
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
	runtimeID string,
	versionID string,
	filters entity.LogFilters,
	cursor *string,
) (*LogPage, error) {
	loggedUserID := ctx.Value("userID").(string)

	searchResult, err := r.versionInteractor.SearchLogs(ctx, loggedUserID, runtimeID, versionID, filters, cursor)
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

func (r *queryResolver) ResourceMetrics(
	ctx context.Context,
	versionId string,
	fromDate string,
	toDate string,
) ([]*entity.ResourceMetrics, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.resourceMetricsInteractor.Get(ctx, loggedUserID, versionId, fromDate, toDate)
}

func (r *subscriptionResolver) WatchResourceMetrics(
	ctx context.Context,
	versionId string,
	fromDate string,
) (<-chan []*entity.ResourceMetrics, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.resourceMetricsInteractor.Watch(ctx, loggedUserID, versionId, fromDate)
}

func (r *runtimeResolver) CreationAuthor(ctx context.Context, runtime *entity.Runtime) (*entity.User, error) {
	userLoader := ctx.Value(middleware.UserLoaderKey).(*dataloader.UserLoader)
	return userLoader.Load(runtime.Owner)
}

func (r *runtimeResolver) CreationDate(_ context.Context, obj *entity.Runtime) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *runtimeResolver) PublishedVersion(ctx context.Context, obj *entity.Runtime) (*entity.Version, error) {
	// TODO Get Runtime Published Version from a property stored in the Runtime entity instead of get all runtime versions.
	// TODO use the version loader to get the published version
	loggedUserID := ctx.Value("userID").(string)

	versions, err := r.versionInteractor.GetByRuntime(loggedUserID, obj.ID)
	if err != nil {
		return nil, err
	}

	var publishedVersion *entity.Version
	for _, v := range versions {
		if v.Status == entity.VersionStatusPublished {
			publishedVersion = v
		}
	}

	return publishedVersion, nil
}

func (r *subscriptionResolver) RuntimeCreated(ctx context.Context) (<-chan *entity.Runtime, error) {
	id := uuid.New().String()

	runtimeCreatedChan := make(chan *entity.Runtime, 1)
	go func() {
		<-ctx.Done()
		delete(runtimeCreatedChannels, id)
	}()

	runtimeCreatedChannels[id] = runtimeCreatedChan

	return runtimeCreatedChan, nil
}

func (r *subscriptionResolver) WatchNodeStatus(ctx context.Context, versionID string) (<-chan *entity.Node, error) {
	loggedUserID := ctx.Value("userID").(string)

	stopCh := make(chan bool)
	inputChan, err := r.versionInteractor.WatchVersionStatus(ctx, loggedUserID, versionID, stopCh)
	if err != nil {
		return nil, err
	}

	r.logger.Info("Starting VersionNodeStatus subscription...")

	outputChan := make(chan *entity.Node)

	go func() {
		for {
			select {
			case nodeStatus := <-inputChan:
				if nodeStatus == nil {
					r.logger.Info("Input channel of VersionNodeStatus subscription closed. Closing output channel...")
					close(outputChan)
					return
				}
				outputChan <- nodeStatus

			case <-ctx.Done():
				r.logger.Info("Stopping VersionNodeStatus subscription...")
				stopCh <- true
				close(outputChan)
				return
			}
		}
	}()

	return outputChan, nil
}

func (r *subscriptionResolver) NodeLogs(ctx context.Context, runtimeID, versionID string, filters entity.LogFilters) (<-chan *entity.NodeLog, error) {
	loggedUserID := ctx.Value("userID").(string)

	stopCh := make(chan bool)
	inputChan, err := r.versionInteractor.WatchNodeLogs(ctx, loggedUserID, runtimeID, versionID, filters, stopCh)
	if err != nil {
		return nil, err
	}

	r.logger.Info("Starting NodeLogs subscription...")

	outputChan := make(chan *entity.NodeLog)

	go func() {
		for {
			select {
			case nodeLog := <-inputChan:
				if nodeLog == nil {
					r.logger.Info("Input channel of NodeLogs subscription closed. Closing output channel...")
					close(outputChan)
					return
				}
				outputChan <- nodeLog

			case <-ctx.Done():
				r.logger.Info("Stopping NodeLogs subscription...")
				stopCh <- true
				close(outputChan)
				return
			}
		}
	}()

	return outputChan, nil
}

func (r *userActivityResolver) Date(_ context.Context, obj *entity.UserActivity) (string, error) {
	return obj.Date.Format(time.RFC3339), nil
}

func (r *userActivityResolver) User(ctx context.Context, obj *entity.UserActivity) (*entity.User, error) {
	userLoader := ctx.Value(middleware.UserLoaderKey).(*dataloader.UserLoader)
	return userLoader.Load(obj.UserID)
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
type versionResolver struct{ *Resolver }
