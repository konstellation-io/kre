package gql

//go:generate go run github.com/99designs/gqlgen --verbose

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/vektah/gqlparser/v2/gqlerror"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt/validator"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

//nolint:gochecknoglobals // needs to be global to be used in the resolver
var versionStatusChannels map[string]chan *entity.Version

//nolint:gochecknoglobals // needs to be global to be used in the resolver
var mux *sync.RWMutex

func initialize() {
	versionStatusChannels = map[string]chan *entity.Version{}
	mux = &sync.RWMutex{}
}

type Resolver struct {
	logger                 logging.Logger
	runtimeInteractor      *usecase.ProductInteractor
	userInteractor         *usecase.UserInteractor
	userActivityInteractor usecase.UserActivityInteracter
	versionInteractor      *usecase.VersionInteractor
	metricsInteractor      *usecase.MetricsInteractor
	cfg                    *config.Config
}

func NewGraphQLResolver(
	logger logging.Logger,
	runtimeInteractor *usecase.ProductInteractor,
	userInteractor *usecase.UserInteractor,
	userActivityInteractor usecase.UserActivityInteracter,
	versionInteractor *usecase.VersionInteractor,
	metricsInteractor *usecase.MetricsInteractor,
	cfg *config.Config,
) *Resolver {
	initialize()

	return &Resolver{
		logger,
		runtimeInteractor,
		userInteractor,
		userActivityInteractor,
		versionInteractor,
		metricsInteractor,
		cfg,
	}
}

func (r *mutationResolver) CreateRuntime(ctx context.Context, input CreateRuntimeInput) (*entity.Product, error) {
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
		if errs, ok := err.(validator.ValidationError); ok {
			extensions := make(map[string]interface{})
			extensions["code"] = "krt_validation_error"
			extensions["details"] = errs.Messages

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
		r.logger.Errorf("[mutationResolver.StartVersion] errors starting version: %s", err)
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
	//nolint:gosimple // legacy code
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

func (r *mutationResolver) UpdateVersionUserConfiguration(ctx context.Context, input UpdateConfigurationInput) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)

	v, err := r.versionInteractor.GetByName(ctx, loggedUserID, input.RuntimeID, input.VersionName)
	if err != nil {
		return nil, err
	}

	cfg := make([]*entity.ConfigurationVariable, len(input.ConfigurationVariables))

	for i, c := range input.ConfigurationVariables {
		cfg[i] = &entity.ConfigurationVariable{
			Key:   c.Key,
			Value: c.Value,
		}
	}

	return r.versionInteractor.UpdateVersionConfig(ctx, loggedUserID, input.RuntimeID, v, cfg)
}

func (r *queryResolver) Metrics(ctx context.Context, runtimeID, versionName,
	startDate, endDate string) (*entity.Metrics, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.metricsInteractor.GetMetrics(ctx, loggedUserID, runtimeID, versionName, startDate, endDate)
}

func (r *queryResolver) Runtime(ctx context.Context, id string) (*entity.Product, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.runtimeInteractor.GetByID(ctx, loggedUserID, id)
}

func (r *queryResolver) Runtimes(ctx context.Context) ([]*entity.Product, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.runtimeInteractor.FindAll(ctx, loggedUserID)
}

func (r *queryResolver) Version(ctx context.Context, name, runtimeID string) (*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.GetByName(ctx, loggedUserID, runtimeID, name)
}

func (r *queryResolver) Versions(ctx context.Context, runtimeID string) ([]*entity.Version, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.GetByRuntime(loggedUserID, runtimeID)
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
	filters entity.LogFilters,
	cursor *string,
) (*LogPage, error) {
	loggedUserID := ctx.Value("userID").(string)

	searchResult, err := r.versionInteractor.SearchLogs(ctx, loggedUserID, runtimeID, filters, cursor)
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

func (r *runtimeResolver) CreationAuthor(_ context.Context, runtime *entity.Product) (string, error) {
	return runtime.Owner, nil
}

func (r *runtimeResolver) CreationDate(_ context.Context, obj *entity.Product) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *runtimeResolver) PublishedVersion(_ context.Context, obj *entity.Product) (*entity.Version, error) {
	if obj.PublishedVersion != "" {
		return r.versionInteractor.GetByID(obj.ID, obj.PublishedVersion)
	}

	return nil, nil
}

func (r *runtimeResolver) MeasurementsURL(_ context.Context, _ *entity.Product) (string, error) {
	return fmt.Sprintf("%s/measurements/%s", r.cfg.Admin.BaseURL, r.cfg.K8s.Namespace), nil
}

func (r *runtimeResolver) DatabaseURL(_ context.Context, _ *entity.Product) (string, error) {
	return fmt.Sprintf("%s/database/%s", r.cfg.Admin.BaseURL, r.cfg.K8s.Namespace), nil
}

func (r *runtimeResolver) EntrypointAddress(_ context.Context, _ *entity.Product) (string, error) {
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

func (r *subscriptionResolver) WatchNodeStatus(ctx context.Context,
	versionName, runtimeID string) (<-chan *entity.Node, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.WatchNodeStatus(ctx, loggedUserID, runtimeID, versionName)
}

func (r *subscriptionResolver) WatchNodeLogs(ctx context.Context, runtimeID, versionName string,
	filters entity.LogFilters) (<-chan *entity.NodeLog, error) {
	loggedUserID := ctx.Value("userID").(string)
	return r.versionInteractor.WatchNodeLogs(ctx, loggedUserID, runtimeID, versionName, filters)
}

func (r *userActivityResolver) Date(_ context.Context, obj *entity.UserActivity) (string, error) {
	return obj.Date.Format(time.RFC3339), nil
}

func (r *userActivityResolver) User(_ context.Context, obj *entity.UserActivity) (string, error) {
	return obj.UserID, nil
}

func (a apiTokenResolver) CreationDate(_ context.Context, obj *entity.APIToken) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (a apiTokenResolver) LastActivity(_ context.Context, obj *entity.APIToken) (*string, error) {
	if obj.LastActivity == nil {
		return nil, nil
	}

	date := obj.LastActivity.Format(time.RFC3339)

	return &date, nil
}

func (r *versionResolver) CreationDate(_ context.Context, obj *entity.Version) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *versionResolver) CreationAuthor(_ context.Context, obj *entity.Version) (string, error) {
	return obj.CreationAuthor, nil
}

func (r *versionResolver) PublicationDate(_ context.Context, obj *entity.Version) (*string, error) {
	if obj.PublicationDate == nil {
		return nil, nil
	}

	result := obj.PublicationDate.Format(time.RFC3339)

	return &result, nil
}

func (r *versionResolver) PublicationAuthor(_ context.Context, obj *entity.Version) (*string, error) {
	if obj.PublicationUserID == nil {
		return nil, nil
	}

	return obj.PublicationUserID, nil
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

// Runtime returns RuntimeResolver implementation.
func (r *Resolver) Runtime() RuntimeResolver { return &runtimeResolver{r} }

// Subscription returns SubscriptionResolver implementation.
func (r *Resolver) Subscription() SubscriptionResolver { return &subscriptionResolver{r} }

// APIToken returns APITokenResolver implementation.
func (r *Resolver) APIToken() ApiTokenResolver { return &apiTokenResolver{r} }

// UserActivity returns UserActivityResolver implementation.
func (r *Resolver) UserActivity() UserActivityResolver { return &userActivityResolver{r} }

// Version returns VersionResolver implementation.
func (r *Resolver) Version() VersionResolver { return &versionResolver{r} }

type mutationResolver struct{ *Resolver }

//nolint:godox // remove this statement when the TODO below is implemented
func (r *mutationResolver) UpdateAccessLevel(ctx context.Context, input UpdateAccessLevelInput) ([]string, error) {
	// TODO implement me
	panic("implement me")
}

type queryResolver struct{ *Resolver }
type runtimeResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
type userActivityResolver struct{ *Resolver }
type apiTokenResolver struct{ *Resolver }
type versionResolver struct{ *Resolver }
