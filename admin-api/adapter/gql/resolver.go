package gql

import (
	"context"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"gitlab.com/konstellation/kre/admin-api/adapter/dataloader"
	"gitlab.com/konstellation/kre/admin-api/delivery/http/middleware"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
)

var runtimeCreatedChannels map[string]chan *entity.Runtime

func init() {
	runtimeCreatedChannels = map[string]chan *entity.Runtime{}
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
func (r *GraphQLResolver) Node() NodeResolver {
	return &nodeResolver{r}
}
func (r *GraphQLResolver) Query() QueryResolver {
	return &queryResolver{r}
}
func (r *GraphQLResolver) Runtime() RuntimeResolver {
	return &runtimeResolver{r}
}
func (r *GraphQLResolver) Subscription() SubscriptionResolver {
	return &subscriptionResolver{r}
}
func (r *GraphQLResolver) UserActivity() UserActivityResolver {
	return &userActivityResolver{r}
}
func (r *GraphQLResolver) Version() VersionResolver {
	return &versionResolver{r}
}
func (r *GraphQLResolver) VersionNodeStatus() VersionNodeStatusResolver {
	return &versionNodeStatusResolver{r}
}

type mutationResolver struct{ *GraphQLResolver }

func (r *mutationResolver) CreateRuntime(ctx context.Context, input CreateRuntimeInput) (*entity.Runtime, error) {
	userID := ctx.Value("userID").(string)
	runtime, onRuntimeStartedChannel, err := r.runtimeInteractor.CreateRuntime(input.Name, userID)

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
	userID := ctx.Value("userID").(string)
	version, err := r.versionInteractor.Create(userID, input.RuntimeID, input.File.File)
	if err != nil {
		return nil, err
	}

	return version, nil
}

func (r *mutationResolver) StartVersion(ctx context.Context, input StartVersionInput) (*entity.Version, error) {
	userID := ctx.Value("userID").(string)
	return r.versionInteractor.Start(userID, input.VersionID)
}

func (r *mutationResolver) StopVersion(ctx context.Context, input StopVersionInput) (*entity.Version, error) {
	userID := ctx.Value("userID").(string)
	return r.versionInteractor.Stop(userID, input.VersionID)
}

func (r *mutationResolver) UnpublishVersion(ctx context.Context, input UnpublishVersionInput) (*entity.Version, error) {
	userID := ctx.Value("userID").(string)
	return r.versionInteractor.Unpublish(userID, input.VersionID)
}

func (r *mutationResolver) PublishVersion(ctx context.Context, input PublishVersionInput) (*entity.Version, error) {
	userID := ctx.Value("userID").(string)
	return r.versionInteractor.Publish(userID, input.VersionID, input.Comment)
}

func (r *mutationResolver) UpdateSettings(ctx context.Context, input SettingsInput) (*entity.Setting, error) {
	userID := ctx.Value("userID").(string)
	settings, err := r.settingInteractor.Get()
	if err != nil {
		return nil, err
	}

	var changes []entity.UserActivity
	if input.SessionLifetimeInDays != nil && settings.SessionLifetimeInDays != *input.SessionLifetimeInDays {
		changes = append(changes, entity.UserActivity{
			UserID: userID,
			Vars: r.userActivityInteractor.NewUpdateSettingVars(
				"SessionLifetimeInDays",
				strconv.Itoa(settings.SessionLifetimeInDays),
				strconv.Itoa(*input.SessionLifetimeInDays)),
		})
		settings.SessionLifetimeInDays = *input.SessionLifetimeInDays
	}

	if input.AuthAllowedDomains != nil {
		changes = append(changes, entity.UserActivity{
			UserID: userID,
			Vars: r.userActivityInteractor.NewUpdateSettingVars(
				"AuthAllowedDomains",
				strings.Join(settings.AuthAllowedDomains, ","),
				strings.Join(input.AuthAllowedDomains, ",")),
		})
		settings.AuthAllowedDomains = input.AuthAllowedDomains
	}

	if len(changes) > 0 {
		err = r.settingInteractor.Update(settings, changes)
		if err != nil {
			return nil, err
		}
	}

	return settings, nil
}

func (r *mutationResolver) UpdateVersionConfiguration(ctx context.Context, input UpdateConfigurationInput) (*entity.Version, error) {
	v, err := r.versionInteractor.GetByID(input.VersionID)
	if err != nil {
		return nil, err
	}

	config := make([]*entity.ConfigVar, len(input.ConfigurationVariables))

	for i, c := range input.ConfigurationVariables {
		config[i] = &entity.ConfigVar{
			Key:   c.Key,
			Value: c.Value,
		}
	}

	return r.versionInteractor.UpdateVersionConfig(v, config)
}

type nodeResolver struct{ *GraphQLResolver }

func (r *nodeResolver) Status(ctx context.Context, obj *entity.Node) (NodeStatus, error) {
	return NodeStatus(obj.Status), nil
}

type queryResolver struct{ *GraphQLResolver }

func (r *queryResolver) Me(ctx context.Context) (*entity.User, error) {
	userID := ctx.Value("userID").(string)
	return r.userInteractor.GetByID(userID)
}

func (r *queryResolver) Users(ctx context.Context) ([]*entity.User, error) {
	return r.userInteractor.GetAllUsers()
}

func (r *queryResolver) Runtime(ctx context.Context, id string) (*entity.Runtime, error) {
	return r.runtimeInteractor.GetByID(id)
}

func (r *queryResolver) Runtimes(ctx context.Context) ([]*entity.Runtime, error) {
	return r.runtimeInteractor.FindAll()
}

func (r *queryResolver) Version(ctx context.Context, id string) (*entity.Version, error) {
	return r.versionInteractor.GetByID(id)
}

func (r *queryResolver) Versions(ctx context.Context, runtimeID string) ([]*entity.Version, error) {
	return r.versionInteractor.GetByRuntime(runtimeID)
}

func (r *queryResolver) Alerts(ctx context.Context) ([]*Alert, error) {
	return []*Alert{}, nil
}

func (r *queryResolver) Settings(ctx context.Context) (*entity.Setting, error) {
	return r.settingInteractor.Get()
}

func (r *queryResolver) UserActivityList(ctx context.Context, userMail *string, typeArg *UserActivityType, fromDate *string, toDate *string, lastID *string) ([]*entity.UserActivity, error) {
	activityType := new(string)
	if typeArg != nil {
		*activityType = typeArg.String()
	} else {
		activityType = nil
	}

	return r.userActivityInteractor.Get(userMail, activityType, fromDate, toDate, lastID)
}

type runtimeResolver struct{ *GraphQLResolver }

func (r *runtimeResolver) CreationAuthor(ctx context.Context, runtime *entity.Runtime) (*entity.User, error) {
	userLoader := ctx.Value(middleware.UserLoaderKey).(*dataloader.UserLoader)
	return userLoader.Load(runtime.Owner)
}

func (r *runtimeResolver) Status(ctx context.Context, obj *entity.Runtime) (RuntimeStatus, error) {
	// TODO enums for custom models
	return RuntimeStatus(obj.Status), nil
}

func (r *runtimeResolver) CreationDate(ctx context.Context, obj *entity.Runtime) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *runtimeResolver) PublishedVersion(ctx context.Context, obj *entity.Runtime) (*entity.Version, error) {
	// TODO Get Runtime Published Version from a property stored in the Runtime entity instead of get all runtime versions.
	// TODO use the version loader to get the published version
	versions, err := r.versionInteractor.GetByRuntime(obj.ID)
	if err != nil {
		return nil, err
	}

	var publishedVersion *entity.Version
	for _, v := range versions {
		if v.Status == string(VersionStatusPublished) {
			publishedVersion = v
		}
	}

	return publishedVersion, nil
}

type subscriptionResolver struct{ *GraphQLResolver }

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

func (r *subscriptionResolver) VersionNodeStatus(ctx context.Context, versionId string) (<-chan *entity.VersionNodeStatus, error) {
	stopCh := make(chan bool)
	inputChan, err := r.versionInteractor.WatchVersionStatus(versionId, stopCh)
	if err != nil {
		return nil, err
	}

	r.logger.Info("------------ STARTING SUBSCRIPTION -------------")

	outputChan := make(chan *entity.VersionNodeStatus)

	go func() {
		for {
			select {
			case nodeStatus := <-inputChan:
				if nodeStatus == nil {
					r.logger.Info("------------ SUBSCRIPTION INPUTCHAN CLOSED. CLOSING -------------")
					close(outputChan)
					return
				}
				outputChan <- nodeStatus

			case <-ctx.Done():
				r.logger.Info("------------ SUBSCRIPTION CTX DONE. STOPPING WATCHER -------------")
				stopCh <- true
				close(outputChan)
				return
			}

		}

	}()

	return outputChan, nil
}

func (r *subscriptionResolver) NodeLogs(ctx context.Context, runtimeID, nodeID string) (<-chan *entity.NodeLog, error) {
	stopCh := make(chan bool)
	inputChan, err := r.versionInteractor.WatchNodeLogs(runtimeID, nodeID, stopCh)
	if err != nil {
		return nil, err
	}

	r.logger.Info("------------ STARTING LOGGER SUBSCRIPTION -------------")

	outputChan := make(chan *entity.NodeLog)

	go func() {
		for {
			select {
			case nodeLog := <-inputChan:
				if nodeLog == nil {
					r.logger.Info("------------ SUBSCRIPTION LOGGER INPUTCHAN CLOSED. CLOSING -------------")
					close(outputChan)
					return
				}
				outputChan <- nodeLog

			case <-ctx.Done():
				r.logger.Info("------------ SUBSCRIPTION CTX DONE. STOPPING WATCHER -------------")
				stopCh <- true
				close(outputChan)
				return
			}

		}

	}()

	return outputChan, nil
}

type userActivityResolver struct{ *GraphQLResolver }

func (r *userActivityResolver) Type(ctx context.Context, obj *entity.UserActivity) (UserActivityType, error) {
	return UserActivityType(obj.Type), nil
}

func (r *userActivityResolver) Date(ctx context.Context, obj *entity.UserActivity) (string, error) {
	return obj.Date.Format(time.RFC3339), nil
}

func (r *userActivityResolver) User(ctx context.Context, obj *entity.UserActivity) (*entity.User, error) {
	userLoader := ctx.Value(middleware.UserLoaderKey).(*dataloader.UserLoader)
	return userLoader.Load(obj.UserID)
}

type versionResolver struct{ *GraphQLResolver }

func (r *versionResolver) Status(ctx context.Context, obj *entity.Version) (VersionStatus, error) {
	return VersionStatus(obj.Status), nil
}

func (r *versionResolver) CreationDate(ctx context.Context, obj *entity.Version) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *versionResolver) CreationAuthor(ctx context.Context, obj *entity.Version) (*entity.User, error) {
	userLoader := ctx.Value(middleware.UserLoaderKey).(*dataloader.UserLoader)
	return userLoader.Load(obj.CreationAuthor)
}

func (r *versionResolver) PublicationDate(ctx context.Context, obj *entity.Version) (*string, error) {
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

// TODO change entity struct to match with the gql definition
func (r *versionResolver) ConfigurationVariables(ctx context.Context, obj *entity.Version) ([]*ConfigurationVariable, error) {
	vars := make([]*ConfigurationVariable, len(obj.Config.Vars))
	for i, c := range obj.Config.Vars {
		vars[i] = &ConfigurationVariable{
			Key:   c.Key,
			Value: c.Value,
		}

		switch c.Type {
		case string(ConfigurationVariableTypeVariable):
			vars[i].Type = ConfigurationVariableTypeVariable
		case string(ConfigurationVariableTypeFile):
			vars[i].Type = ConfigurationVariableTypeFile
		}
	}
	return vars, nil
}

// TODO change entity struct to match with the gql definition
func (r *versionResolver) ConfigurationCompleted(ctx context.Context, obj *entity.Version) (bool, error) {
	return obj.Config.Completed, nil
}

type versionNodeStatusResolver struct{ *GraphQLResolver }

func (r *versionNodeStatusResolver) Date(ctx context.Context, obj *entity.VersionNodeStatus) (string, error) {
	return time.Now().Format(time.RFC3339), nil
}

func (r *versionNodeStatusResolver) Status(ctx context.Context, obj *entity.VersionNodeStatus) (NodeStatus, error) {
	return NodeStatus(obj.Status), nil
}
