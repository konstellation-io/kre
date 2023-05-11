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
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"
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
	loggedUser := ctx.Value("user").(*token.UserRoles)

	r.logger.Debug("Creating product with id " + input.ID)

	product, err := r.runtimeInteractor.CreateProduct(ctx, loggedUser, input.ID, input.Name, input.Description)
	if err != nil {
		r.logger.Error("Error creating product: " + err.Error())
		return nil, err
	}

	return product, nil
}

func (r *mutationResolver) CreateVersion(ctx context.Context, input CreateVersionInput) (*entity.Version, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)

	version, notifyCh, err := r.versionInteractor.Create(ctx, loggedUser, input.RuntimeID, input.File.File)
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
	loggedUser := ctx.Value("user").(*token.UserRoles)

	v, notifyCh, err := r.versionInteractor.Start(ctx, loggedUser, input.RuntimeID, input.VersionName, input.Comment)
	if err != nil {
		r.logger.Errorf("[mutationResolver.StartVersion] errors starting version: %s", err)
		return nil, err
	}

	go r.notifyVersionStatus(notifyCh)

	return v, err
}

func (r *mutationResolver) StopVersion(ctx context.Context, input StopVersionInput) (*entity.Version, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)

	v, notifyCh, err := r.versionInteractor.Stop(ctx, loggedUser, input.RuntimeID, input.VersionName, input.Comment)
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
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.versionInteractor.Unpublish(ctx, loggedUser, input.RuntimeID, input.VersionName, input.Comment)
}

func (r *mutationResolver) PublishVersion(ctx context.Context, input PublishVersionInput) (*entity.Version, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.versionInteractor.Publish(ctx, loggedUser, input.RuntimeID, input.VersionName, input.Comment)
}

func (r *mutationResolver) UpdateVersionUserConfiguration(ctx context.Context, input UpdateConfigurationInput) (*entity.Version, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)

	v, err := r.versionInteractor.GetByName(ctx, loggedUser, input.RuntimeID, input.VersionName)
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

	return r.versionInteractor.UpdateVersionConfig(ctx, loggedUser, input.RuntimeID, v, cfg)
}

func (r *queryResolver) Metrics(ctx context.Context, runtimeId, versionName, startDate, endDate string) (*entity.Metrics, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.metricsInteractor.GetMetrics(ctx, loggedUser, runtimeId, versionName, startDate, endDate)
}

func (r *queryResolver) Runtime(ctx context.Context, id string) (*entity.Product, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.runtimeInteractor.GetByID(ctx, loggedUser, id)
}

func (r *queryResolver) Runtimes(ctx context.Context) ([]*entity.Product, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.runtimeInteractor.FindAll(ctx, loggedUser)
}

func (r *queryResolver) Version(ctx context.Context, name, runtimeId string) (*entity.Version, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.versionInteractor.GetByName(ctx, loggedUser, runtimeId, name)
}

func (r *queryResolver) Versions(ctx context.Context, productID string) ([]*entity.Version, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.versionInteractor.GetByProduct(loggedUser, productID)
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
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.userActivityInteractor.Get(ctx, loggedUser, userEmail, types, versionIds, fromDate, toDate, lastID)
}

func (r *queryResolver) Logs(
	ctx context.Context,
	runtimeID string,
	filters entity.LogFilters,
	cursor *string,
) (*LogPage, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)

	searchResult, err := r.versionInteractor.SearchLogs(ctx, loggedUser, runtimeID, filters, cursor)
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
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.versionInteractor.WatchNodeStatus(ctx, loggedUser, runtimeID, versionName)
}

func (r *subscriptionResolver) WatchNodeLogs(ctx context.Context, runtimeID, versionName string,
	filters entity.LogFilters) (<-chan *entity.NodeLog, error) {
	loggedUser := ctx.Value("user").(*token.UserRoles)
	return r.versionInteractor.WatchNodeLogs(ctx, loggedUser, runtimeID, versionName, filters)
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
