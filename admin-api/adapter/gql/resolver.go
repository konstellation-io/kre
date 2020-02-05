package gql

import (
	"context"
	"github.com/google/uuid"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"strconv"
	"strings"
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

	runtime, onRuntimeStartedChannel, err := r.runtimeInteractor.CreateRuntime(input.Name, userID)

	go func() {
		runtime := <-onRuntimeStartedChannel

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

func (r *mutationResolver) StartVersion(ctx context.Context, input StartVersionInput) (*Version, error) {
	userID := ctx.Value("userID").(string)

	version, err := r.versionInteractor.Start(userID, input.VersionID)
	if err != nil {
		return nil, err
	}

	creationUser, err := r.userInteractor.GetByID(version.CreationAuthor)
	if err != nil {
		return nil, err
	}

	return toGQLVersion(version, creationUser, nil), nil
}

func (r *mutationResolver) StopVersion(ctx context.Context, input StopVersionInput) (*Version, error) {
	userID := ctx.Value("userID").(string)

	version, err := r.versionInteractor.Stop(userID, input.VersionID)
	if err != nil {
		return nil, err
	}

	creationUser, err := r.userInteractor.GetByID(version.CreationAuthor)
	if err != nil {
		return nil, err
	}

	return toGQLVersion(version, creationUser, nil), nil
}

func (r *mutationResolver) UnpublishVersion(ctx context.Context, input UnpublishVersionInput) (*Version, error) {
	userID := ctx.Value("userID").(string)

	version, err := r.versionInteractor.Unpublish(userID, input.VersionID)
	if err != nil {
		return nil, err
	}

	creationUser, err := r.userInteractor.GetByID(version.CreationAuthor)
	if err != nil {
		return nil, err
	}

	return toGQLVersion(version, creationUser, nil), nil
}

func (r *mutationResolver) PublishVersion(ctx context.Context, input PublishVersionInput) (*Version, error) {
	userID := ctx.Value("userID").(string)

	version, err := r.versionInteractor.Publish(userID, input.VersionID, input.Comment)
	if err != nil {
		return nil, err
	}

	creationUser, err := r.userInteractor.GetByID(version.CreationAuthor)
	if err != nil {
		return nil, err
	}

	publicationUser, err := r.userInteractor.GetByID(userID)
	if err != nil {
		return nil, err
	}

	return toGQLVersion(version, creationUser, publicationUser), nil
}

func (r *mutationResolver) UpdateSettings(ctx context.Context, input SettingsInput) (*UpdateSettingsResponse, error) {
	userID := ctx.Value("userID").(string)
	settings, err := r.settingInteractor.Get()
	if err != nil {
		return nil, err
	}

	var changes []entity.UserActivity
	if input.SessionLifetimeInDays != nil && settings.SessionLifetimeInDays != *input.SessionLifetimeInDays {
		changes = append(changes, entity.UserActivity{
			User: entity.User{
				ID: userID,
			},
			Vars: []entity.UserActivityVar{
				{
					Key:   "SETTING_NAME",
					Value: "SessionLifetimeInDays",
				},
				{
					Key:   "OLD_VALUE",
					Value: strconv.Itoa(settings.SessionLifetimeInDays),
				},
				{
					Key:   "NEW_VALUE",
					Value: strconv.Itoa(*input.SessionLifetimeInDays),
				},
			},
		})
		settings.SessionLifetimeInDays = *input.SessionLifetimeInDays
	}

	if input.AuthAllowedDomains != nil {
		changes = append(changes, entity.UserActivity{
			User: entity.User{
				ID: userID,
			},
			Vars: []entity.UserActivityVar{
				{
					Key:   "SETTING_NAME",
					Value: "AuthAllowedDomains",
				},
				{
					Key:   "OLD_VALUE",
					Value: strings.Join(settings.AuthAllowedDomains, ","),
				},
				{
					Key:   "NEW_VALUE",
					Value: strings.Join(input.AuthAllowedDomains, ","),
				},
			},
		})
		settings.AuthAllowedDomains = input.AuthAllowedDomains
	}

	if len(changes) > 0 {
		err = r.settingInteractor.Update(settings, changes)
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

func (r *mutationResolver) UpdateVersionConfiguration(ctx context.Context, input UpdateConfigurationInput) (*Version, error) {
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

	v, err = r.versionInteractor.UpdateVersionConfig(v, config)
	if err != nil {
		return nil, err
	}

	creationUser, err := r.userInteractor.GetByID(v.CreationAuthor)
	if err != nil && err != usecase.ErrUserNotFound {
		return nil, err
	}

	var publicationUser *entity.User
	if v.PublicationUserID != nil {
		publicationUser, err = r.userInteractor.GetByID(*v.PublicationUserID)
		if err != nil && err != usecase.ErrUserNotFound {
			return nil, err
		}
	}

	gqlVersion := toGQLVersion(v, creationUser, publicationUser)
	return gqlVersion, nil
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

func (r *queryResolver) Users(ctx context.Context) ([]*User, error) {
	users, err := r.userInteractor.GetAllUsers()
	if err != nil {
		return nil, err
	}

	var result []*User
	for _, user := range users {
		result = append(result, &User{
			ID:    user.ID,
			Email: user.Email,
		})
	}

	return result, nil
}

// TODO Get Runtime Published Version from a property stored in the Runtime entity instead of get all runtime versions.
func (r *queryResolver) getPublishedVersion(runtimeID string) (*Version, error) {
	versions, err := r.versionInteractor.GetByRuntime(runtimeID)
	if err != nil {
		return nil, err
	}

	var publishedVersion *Version
	for _, v := range versions {
		if v.Status == string(VersionStatusPublished) {
			creationUser, err := r.userInteractor.GetByID(v.CreationAuthor)
			if err != nil && err != usecase.ErrUserNotFound {
				return nil, err
			}
			var publicationUser *entity.User
			if v.PublicationUserID != nil {
				publicationUser, err = r.userInteractor.GetByID(*v.PublicationUserID)
				if err != nil && err != usecase.ErrUserNotFound {
					return nil, err
				}
			}
			publishedVersion = toGQLVersion(&v, creationUser, publicationUser)
		}
	}

	return publishedVersion, nil
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

	gqlRuntime := toGQLRuntime(runtime, owner)
	publishedVersion, err := r.getPublishedVersion(runtime.ID)
	if err != nil {
		return nil, err
	}
	gqlRuntime.PublishedVersion = publishedVersion

	return gqlRuntime, nil
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
		}

		// TODO Use https://gqlgen.com/reference/dataloaders/ to get the users data
		publishedVersion, err := r.getPublishedVersion(runtime.ID)
		if err != nil {
			return nil, err
		}
		gqlRuntime.PublishedVersion = publishedVersion

		gqlRuntimes = append(gqlRuntimes, gqlRuntime)
	}

	return gqlRuntimes, nil
}

func (r *queryResolver) Version(ctx context.Context, id string) (*Version, error) {
	v, err := r.versionInteractor.GetByID(id)
	if err != nil {
		return nil, err
	}

	creationUser, err := r.userInteractor.GetByID(v.CreationAuthor)
	if err != nil && err != usecase.ErrUserNotFound {
		return nil, err
	}

	var publicationUser *entity.User
	if v.PublicationUserID != nil {
		publicationUser, err = r.userInteractor.GetByID(*v.PublicationUserID)
		if err != nil && err != usecase.ErrUserNotFound {
			return nil, err
		}
	}

	gqlVersion := toGQLVersion(v, creationUser, publicationUser)
	return gqlVersion, nil
}

func (r *queryResolver) Versions(ctx context.Context, runtimeID string) ([]*Version, error) {
	versions, err := r.versionInteractor.GetByRuntime(runtimeID)
	if err != nil {
		return nil, err
	}

	var gqlVersions []*Version
	for _, v := range versions {
		creationUser, err := r.userInteractor.GetByID(v.CreationAuthor)
		if err != nil && err != usecase.ErrUserNotFound {
			return nil, err
		}
		var publicationUser *entity.User
		if v.PublicationUserID != nil {
			publicationUser, err = r.userInteractor.GetByID(*v.PublicationUserID)
			if err != nil && err != usecase.ErrUserNotFound {
				return nil, err
			}
		}
		gqlVersion := toGQLVersion(&v, creationUser, publicationUser)
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

func (r *queryResolver) UserActivityList(ctx context.Context, userMail *string, typeArg *UserActivityType, fromDate *string, toDate *string, lastID *string) ([]*UserActivity, error) {
	activityType := new(string)
	if typeArg != nil {
		*activityType = typeArg.String()
	} else {
		activityType = nil
	}

	activities, err := r.userActivityInteractor.Get(userMail, activityType, fromDate, toDate, lastID)
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
			Date: a.Date.Format(time.RFC3339),
			Type: UserActivityType(a.Type),
			Vars: toGQLUserActivityVars(a.Vars),
		})
	}

	return result, nil
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

func (r *subscriptionResolver) VersionNodeStatus(ctx context.Context, versionId string) (<-chan *VersionNodeStatus, error) {
	stopCh := make(chan bool)
	inputChan, err := r.versionInteractor.WatchVersionStatus(versionId, stopCh)
	if err != nil {
		return nil, err
	}

	r.logger.Info("------------ STARTING SUBSCRIPTION -------------")

	outputChan := make(chan *VersionNodeStatus)

	go func() {
		for {
			select {
			case nodeStatus := <-inputChan:
				if nodeStatus == nil {
					r.logger.Info("------------ SUBSCRIPTION INPUTCHAN CLOSED. CLOSING -------------")
					close(outputChan)
					return
				}
				outputChan <- toGQlVersionNodeStatus(nodeStatus)

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

func (r *subscriptionResolver) NodeLogs(ctx context.Context, runtimeID, nodeID string) (<-chan *NodeLog, error) {
	stopCh := make(chan bool)
	inputChan, err := r.versionInteractor.WatchNodeLogs(runtimeID, nodeID, stopCh)
	if err != nil {
		return nil, err
	}

	r.logger.Info("------------ STARTING LOGGER SUBSCRIPTION -------------")

	outputChan := make(chan *NodeLog)

	go func() {
		for {
			select {
			case nodeLog := <-inputChan:
				if nodeLog == nil {
					r.logger.Info("------------ SUBSCRIPTION LOGGER INPUTCHAN CLOSED. CLOSING -------------")
					close(outputChan)
					return
				}
				outputChan <- toGQlNodeLog(nodeLog)

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
