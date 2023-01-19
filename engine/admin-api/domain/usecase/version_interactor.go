package usecase

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"strings"
	"time"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/repository"
	"github.com/konstellation-io/kre/engine/admin-api/domain/service"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt/parser"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt/validator"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/version"
)

var (
	// ErrVersionNotFound error
	ErrVersionNotFound = errors.New("error version not found")
	// ErrVersionDuplicated error
	ErrVersionDuplicated = errors.New("error version duplicated")
	// ErrVersionConfigIncomplete error
	ErrVersionConfigIncomplete = errors.New("version config is incomplete")
	// ErrVersionConfigInvalidKey error
	ErrVersionConfigInvalidKey = errors.New("version config contains an unknown key")
	// ErrUpdatingStartedVersionConfig error
	ErrUpdatingStartedVersionConfig = errors.New("config can't be incomplete for started version")
	// ErrInvalidVersionStatusBeforeStarting error
	ErrInvalidVersionStatusBeforeStarting = errors.New("the version must be stopped before starting")
	// ErrInvalidVersionStatusBeforeStopping error
	ErrInvalidVersionStatusBeforeStopping = errors.New("the version must be started before stopping")
	// ErrInvalidVersionStatusBeforePublishing error
	ErrInvalidVersionStatusBeforePublishing = errors.New("the version must be started before publishing")
	// ErrInvalidVersionStatusBeforeUnpublishing error
	ErrInvalidVersionStatusBeforeUnpublishing = errors.New("the version must be published before unpublishing")
)

// VersionInteractor contains app logic about Version entities
type VersionInteractor struct {
	cfg                    *config.Config
	logger                 logging.Logger
	versionRepo            repository.VersionRepo
	runtimeRepo            repository.RuntimeRepo
	versionService         service.VersionService
	natsManagerService     service.NatsManagerService
	userActivityInteractor UserActivityInteracter
	accessControl          auth.AccessControl
	idGenerator            version.IDGenerator
	docGenerator           version.DocGenerator
	dashboardService       service.DashboardService
	nodeLogRepo            repository.NodeLogRepository
}

// NewVersionInteractor creates a new interactor
func NewVersionInteractor(
	cfg *config.Config,
	logger logging.Logger,
	versionRepo repository.VersionRepo,
	runtimeRepo repository.RuntimeRepo,
	versionService service.VersionService,
	natsManagerService service.NatsManagerService,
	userActivityInteractor UserActivityInteracter,
	accessControl auth.AccessControl,
	idGenerator version.IDGenerator,
	docGenerator version.DocGenerator,
	dashboardService service.DashboardService,
	nodeLogRepo repository.NodeLogRepository,
) *VersionInteractor {
	return &VersionInteractor{
		cfg,
		logger,
		versionRepo,
		runtimeRepo,
		versionService,
		natsManagerService,
		userActivityInteractor,
		accessControl,
		idGenerator,
		docGenerator,
		dashboardService,
		nodeLogRepo,
	}
}

func (i *VersionInteractor) filterConfigVars(loggedUserID string, version *entity.Version) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		version.Config.Vars = nil
	}
}

// GetByName returns a Version by its unique name
func (i *VersionInteractor) GetByName(ctx context.Context, loggedUserID, runtimeId, name string) (*entity.Version, error) {
	v, err := i.versionRepo.GetByName(ctx, runtimeId, name)
	if err != nil {
		return nil, err
	}

	i.filterConfigVars(loggedUserID, v)

	return v, nil
}

func (i *VersionInteractor) GetByID(runtimeId, versionId string) (*entity.Version, error) {
	return i.versionRepo.GetByID(runtimeId, versionId)
}

// GetByRuntime returns all Versions of the given Runtime
func (i *VersionInteractor) GetByRuntime(loggedUserID, runtimeID string) ([]*entity.Version, error) {
	versions, err := i.versionRepo.GetByRuntime(runtimeID)
	if err != nil {
		return nil, err
	}

	for _, v := range versions {
		i.filterConfigVars(loggedUserID, v)
	}

	return versions, nil
}

func (i *VersionInteractor) copyStreamToTempFile(krtFile io.Reader) (*os.File, error) {
	tmpFile, err := os.CreateTemp("", "version")

	if err != nil {
		return nil, fmt.Errorf("error creating temp file for version: %w", err)
	}

	_, err = io.Copy(tmpFile, krtFile)
	if err != nil {
		return nil, fmt.Errorf("error copying temp file for version: %w", err)
	}

	i.logger.Infof("Created temp file: %s", tmpFile.Name())

	return tmpFile, nil
}

// Create creates a Version on the DB based on the content of a KRT file
func (i *VersionInteractor) Create(ctx context.Context, loggedUserID string, runtimeID string, krtFile io.Reader) (*entity.Version, chan *entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(ctx, runtimeID)
	if err != nil {
		return nil, nil, fmt.Errorf("error runtime repo GetById: %w", err)
	}
	// Check if the version is duplicated
	versions, err := i.versionRepo.GetByRuntime(runtimeID)
	if err != nil {
		return nil, nil, ErrVersionDuplicated
	}

	tmpDir, err := os.MkdirTemp("", "version")
	if err != nil {
		return nil, nil, fmt.Errorf("error creating temp dir for version: %w", err)
	}
	i.logger.Info("Created temp dir to extract the KRT files at " + tmpDir)

	tmpKrtFile, err := i.copyStreamToTempFile(krtFile)
	if err != nil {
		return nil, nil, fmt.Errorf("error creating temp krt file for version: %w", err)
	}

	valuesValidator := validator.NewYamlFieldsValidator()
	krtYml, err := parser.ProcessAndValidateKrt(i.logger, valuesValidator, tmpKrtFile.Name(), tmpDir)
	if err != nil {
		return nil, nil, err
	}

	duplicatedVersion, err := i.versionRepo.GetByName(ctx, runtimeID, krtYml.Version)
	if err != nil && !errors.Is(err, ErrVersionNotFound) {
		return nil, nil, fmt.Errorf("error version repo GetByName: %w", err)
	}
	if duplicatedVersion != nil {
		return nil, nil, ErrVersionDuplicated
	}

	workflows, err := i.generateWorkflows(krtYml)
	if err != nil {
		return nil, nil, fmt.Errorf("error generating workflows: %w", err)
	}

	existingConfig := readExistingConf(versions)
	cfg := fillNewConfWithExisting(existingConfig, krtYml)

	krtVersion, ok := entity.ParseKRTVersionFromString(krtYml.KrtVersion)
	if !ok {
		return nil, nil, fmt.Errorf("error krtVersion input from krt.yml not valid: %s", krtYml.KrtVersion)
	}
	versionCreated, err := i.versionRepo.Create(loggedUserID, runtimeID, &entity.Version{
		KrtVersion:  krtVersion,
		Name:        krtYml.Version,
		Description: krtYml.Description,
		Config:      cfg,
		Entrypoint: entity.Entrypoint{
			ProtoFile: krtYml.Entrypoint.Proto,
			Image:     krtYml.Entrypoint.Image,
		},
		Workflows: workflows,
	})
	if err != nil {
		return nil, nil, err
	}

	i.logger.Info("Version created")

	notifyStatusCh := make(chan *entity.Version, 1)

	go i.completeVersionCreation(loggedUserID, tmpKrtFile, krtYml, tmpDir, runtime, versionCreated, notifyStatusCh)

	return versionCreated, notifyStatusCh, nil
}

func (i *VersionInteractor) completeVersionCreation(
	loggedUserID string,
	tmpKrtFile *os.File,
	krtYml *krt.Krt,
	tmpDir string,
	runtime *entity.Runtime,
	versionCreated *entity.Version,
	notifyStatusCh chan *entity.Version,
) {
	ctx := context.Background()
	defer close(notifyStatusCh)

	defer func() {
		err := tmpKrtFile.Close()
		if err != nil {
			i.logger.Errorf("error closing file: %s", err)
			return
		}

		err = os.Remove(tmpKrtFile.Name())
		if err != nil {
			i.logger.Errorf("error removing file: %s", err)
		}
	}()

	contentErrors := parser.ProcessContent(i.logger, krtYml, tmpKrtFile.Name(), tmpDir)
	if len(contentErrors) > 0 {
		errorMessage := "error processing krt"
		contentErrors = append([]error{fmt.Errorf(errorMessage)}, contentErrors...)
	}

	dashboardsFolder := path.Join(tmpDir, "metrics/dashboards")
	contentErrors = i.saveKRTDashboards(ctx, dashboardsFolder, runtime, versionCreated, contentErrors)

	docFolder := path.Join(tmpDir, "docs")
	contentErrors = i.saveKRTDoc(runtime.ID, docFolder, versionCreated, contentErrors, ctx)

	err := i.versionRepo.UploadKRTFile(runtime.ID, versionCreated, tmpKrtFile.Name())
	if err != nil {
		errorMessage := "error storing KRT file"
		contentErrors = append([]error{errors.New(errorMessage)}, contentErrors...)
	}

	if len(contentErrors) > 0 {
		i.setStatusError(ctx, runtime.ID, versionCreated, contentErrors, notifyStatusCh)
		return
	}

	err = i.versionRepo.SetStatus(ctx, runtime.ID, versionCreated.ID, entity.VersionStatusCreated)
	if err != nil {
		i.logger.Errorf("error setting version status: %s", err)
		return
	}

	// Notify state
	versionCreated.Status = entity.VersionStatusCreated
	notifyStatusCh <- versionCreated

	err = i.userActivityInteractor.RegisterCreateAction(loggedUserID, runtime.ID, versionCreated)
	if err != nil {
		i.logger.Errorf("error registering activity: %s", err)
	}
}

func (i *VersionInteractor) saveKRTDashboards(ctx context.Context, dashboardsFolder string, runtime *entity.Runtime, versionCreated *entity.Version, contentErrors []error) []error {
	if _, err := os.Stat(path.Join(dashboardsFolder)); err == nil {
		err := i.storeDashboards(ctx, dashboardsFolder, runtime.ID, versionCreated.Name)
		if err != nil {
			errorMessage := "error creating dashboard"
			contentErrors = append(contentErrors, fmt.Errorf(errorMessage))
		}
	}
	return contentErrors
}

func (i *VersionInteractor) saveKRTDoc(runtimeId, docFolder string, versionCreated *entity.Version, contentErrors []error, ctx context.Context) []error {
	if _, err := os.Stat(path.Join(docFolder, "README.md")); err == nil {
		err = i.docGenerator.Generate(versionCreated.Name, docFolder)
		if err != nil {
			errorMessage := "error generating version doc"
			contentErrors = append(contentErrors, fmt.Errorf(errorMessage))
		}

		err = i.versionRepo.SetHasDoc(ctx, runtimeId, versionCreated.ID, true)
		if err != nil {
			errorMessage := "error updating has doc field"
			contentErrors = append(contentErrors, fmt.Errorf(errorMessage))
		}
	} else {
		i.logger.Infof("No documentation found inside the krt files")
	}
	return contentErrors
}

func (i *VersionInteractor) generateWorkflows(krtYml *krt.Krt) ([]*entity.Workflow, error) {
	var workflows []*entity.Workflow
	if len(krtYml.Workflows) == 0 {
		return workflows, fmt.Errorf("error generating workflows: there are no defined workflows")
	}

	for _, w := range krtYml.Workflows {
		var nodes []entity.Node

		if len(w.Nodes) == 0 {
			return nil, fmt.Errorf("error generating workflows: workflow \"%s\" doesn't have nodes defined", w.Name)
		}

		for _, node := range w.Nodes {
			nodes = append(nodes, entity.Node{
				ID:            i.idGenerator.NewID(),
				Name:          node.Name,
				Image:         node.Image,
				Src:           node.Src,
				GPU:           node.GPU,
				Subscriptions: node.Subscriptions,
			})
		}
		workflows = append(workflows, &entity.Workflow{
			ID:         i.idGenerator.NewID(),
			Name:       w.Name,
			Entrypoint: w.Entrypoint,
			Nodes:      nodes,
			Exitpoint:  w.Exitpoint,
		})
	}

	return workflows, nil
}

// Start create the resources of the given Version
func (i *VersionInteractor) Start(
	ctx context.Context,
	loggedUserID string,
	runtimeId string,
	versionName string,
	comment string,
) (*entity.Version, chan *entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, nil, err
	}

	i.logger.Infof("The user %s is starting version %s", loggedUserID, versionName)

	v, err := i.versionRepo.GetByName(ctx, runtimeId, versionName)
	if err != nil {
		return nil, nil, err
	}

	if !v.CanBeStarted() {
		return nil, nil, ErrInvalidVersionStatusBeforeStarting
	}

	if !v.Config.Completed {
		return nil, nil, ErrVersionConfigIncomplete
	}

	notifyStatusCh := make(chan *entity.Version, 1)

	err = i.versionRepo.SetStatus(ctx, runtimeId, v.ID, entity.VersionStatusStarting)
	if err != nil {
		return nil, nil, err
	}

	// Notify intermediate state
	v.Status = entity.VersionStatusStarting
	notifyStatusCh <- v

	err = i.userActivityInteractor.RegisterStartAction(loggedUserID, runtimeId, v, comment)
	if err != nil {
		return nil, nil, err
	}

	go i.changeStatusAndNotify(runtimeId, v, entity.VersionStatusStarted, notifyStatusCh)

	return v, notifyStatusCh, nil
}

// Stop removes the resources of the given Version
func (i *VersionInteractor) Stop(
	ctx context.Context,
	loggedUserID string,
	runtimeId string,
	versionName string,
	comment string,
) (*entity.Version, chan *entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, nil, err
	}

	i.logger.Infof("The user %s is stopping version %s on runtime %s", loggedUserID, versionName, runtimeId)

	v, err := i.versionRepo.GetByName(ctx, runtimeId, versionName)
	if err != nil {
		return nil, nil, err
	}

	if !v.CanBeStopped() {
		return nil, nil, ErrInvalidVersionStatusBeforeStopping
	}

	err = i.versionRepo.SetStatus(ctx, runtimeId, v.ID, entity.VersionStatusStopping)
	if err != nil {
		return nil, nil, err
	}

	notifyStatusCh := make(chan *entity.Version, 1)

	// Notify intermediate state
	v.Status = entity.VersionStatusStopping
	notifyStatusCh <- v

	err = i.userActivityInteractor.RegisterStopAction(loggedUserID, runtimeId, v, comment)
	if err != nil {
		return nil, nil, err
	}

	go i.changeStatusAndNotify(runtimeId, v, entity.VersionStatusStopped, notifyStatusCh)

	return v, notifyStatusCh, nil
}

func (i *VersionInteractor) changeStatusAndNotify(
	runtimeId string,
	version *entity.Version,
	status entity.VersionStatus,
	notifyStatusCh chan *entity.Version,
) {
	// WARNING: This function doesn't handle error because there is no  ERROR status defined for a Version
	ctx, cancel := context.WithTimeout(context.Background(), i.cfg.Application.VersionStatusTimeout)
	defer func() {
		cancel()
		close(notifyStatusCh)
		i.logger.Debug("[versionInteractor.changeStatusAndNotify] channel closed")
	}()

	if status == entity.VersionStatusStarted {
		err := i.natsManagerService.CreateStreams(ctx, runtimeId, version)
		i.logger.Info("First check -----------------")
		if err != nil {
			i.logger.Errorf("[versionInteractor.changeStatusAndNotify] error setting version status '%s'[status:%s]: %s", version.Name, status, err)
		}
		worklfowsStreamConfig, err := i.natsManagerService.GetVersionNatsConfig(ctx, runtimeId, version)
		i.logger.Info("Second check -----------------")
		if err != nil {
			i.logger.Errorf("[versionInteractor.changeStatusAndNotify] error setting version status '%s'[status:%s]: %s", version.Name, status, err)
		}
		err = i.versionService.Start(ctx, runtimeId, version, worklfowsStreamConfig)
		i.logger.Info("First check -----------------")
		if err != nil {
			i.logger.Errorf("[versionInteractor.changeStatusAndNotify] error setting version status '%s'[status:%s]: %s", version.Name, status, err)
		}
	}

	if status == entity.VersionStatusStopped {
		err := i.natsManagerService.DeleteStreams(ctx, runtimeId, version)
		if err != nil {
			i.logger.Errorf("[versionInteractor.changeStatusAndNotify] error setting version status '%s'[status:%s]: %s", version.Name, status, err)
		}
		err = i.versionService.Stop(ctx, runtimeId, version)
		if err != nil {
			i.logger.Errorf("[versionInteractor.changeStatusAndNotify] error setting version status '%s'[status:%s]: %s", version.Name, status, err)
		}
	}

	err := i.versionRepo.SetStatus(ctx, runtimeId, version.ID, status)
	if err != nil {
		i.logger.Errorf("[versionInteractor.Start] error setting version status '%s'[status:%s]: %s", version.Name, status, err)
	}
	version.Status = status
	notifyStatusCh <- version
	i.logger.Infof("[versionInteractor.Start] '%s' version status changed to %s", version.Name, status)
}

// Publish set a Version as published on DB and K8s
func (i *VersionInteractor) Publish(ctx context.Context, loggedUserID string, runtimeId string, versionName string, comment string) (*entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, err
	}

	i.logger.Infof("The user %s is publishing version %s", loggedUserID, versionName)

	v, err := i.versionRepo.GetByName(ctx, runtimeId, versionName)
	if err != nil {
		return nil, err
	}

	if v.Status != entity.VersionStatusStarted {
		return nil, ErrInvalidVersionStatusBeforePublishing
	}

	err = i.versionService.Publish(runtimeId, v)
	if err != nil {
		return nil, err
	}

	previousPublishedVersion, err := i.versionRepo.ClearPublishedVersion(ctx, runtimeId)
	if err != nil {
		return nil, fmt.Errorf("error unpublishing previous version: %w", err)
	}

	now := time.Now()
	v.PublicationDate = &now
	v.PublicationUserID = &loggedUserID
	v.Status = entity.VersionStatusPublished
	err = i.versionRepo.Update(runtimeId, v)
	if err != nil {
		return nil, err
	}

	err = i.userActivityInteractor.RegisterPublishAction(loggedUserID, runtimeId, v, previousPublishedVersion, comment)
	if err != nil {
		return nil, err
	}

	return v, nil
}

// Unpublish set a Version as not published on DB and K8s
func (i *VersionInteractor) Unpublish(ctx context.Context, loggedUserID string, runtimeId string, versionName string, comment string) (*entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, err
	}

	i.logger.Infof("The user %s is unpublishing version %s", loggedUserID, versionName)

	v, err := i.versionRepo.GetByName(ctx, runtimeId, versionName)
	if err != nil {
		return nil, err
	}

	if v.Status != entity.VersionStatusPublished {
		return nil, ErrInvalidVersionStatusBeforeUnpublishing
	}

	err = i.versionService.Unpublish(runtimeId, v)
	if err != nil {
		return nil, err
	}

	v.PublicationUserID = nil
	v.PublicationDate = nil
	v.Status = entity.VersionStatusStarted
	err = i.versionRepo.Update(runtimeId, v)
	if err != nil {
		return nil, err
	}

	err = i.userActivityInteractor.RegisterUnpublishAction(loggedUserID, runtimeId, v, comment)
	if err != nil {
		return nil, err
	}

	return v, nil
}

func (i *VersionInteractor) UpdateVersionConfig(ctx context.Context, loggedUserID, runtimeId string, version *entity.Version, config []*entity.ConfigurationVariable) (*entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, err
	}

	err := i.validateNewConfig(version.Config.Vars, config)
	if err != nil {
		return nil, err
	}

	isStarted := version.PublishedOrStarted()

	newConfig, newConfigIsComplete := generateNewConfig(version.Config.Vars, config)

	if isStarted && !newConfigIsComplete {
		return nil, ErrUpdatingStartedVersionConfig
	}

	version.Config.Vars = newConfig
	version.Config.Completed = newConfigIsComplete

	// No need to restart PODs if there are no resources running
	if isStarted {
		err = i.versionService.UpdateConfig(runtimeId, version)
		if err != nil {
			return nil, err
		}
	}

	err = i.versionRepo.Update(runtimeId, version)
	if err != nil {
		return nil, err
	}

	return version, nil
}

func (i *VersionInteractor) WatchNodeStatus(ctx context.Context, loggedUserID, runtimeId, versionName string) (<-chan *entity.Node, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActView); err != nil {
		return nil, err
	}

	v, err := i.versionRepo.GetByName(ctx, runtimeId, versionName)
	if err != nil {
		return nil, err
	}

	return i.versionService.WatchNodeStatus(ctx, runtimeId, v.Name)
}

func (i *VersionInteractor) WatchNodeLogs(
	ctx context.Context,
	loggedUserID, runtimeId, versionName string,
	filters entity.LogFilters,
) (<-chan *entity.NodeLog, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResLogs, auth.ActView); err != nil {
		return nil, err
	}

	return i.nodeLogRepo.WatchNodeLogs(ctx, runtimeId, versionName, filters)
}

func (i *VersionInteractor) SearchLogs(
	ctx context.Context,
	loggedUserID,
	runtimeId string,
	filters entity.LogFilters,
	cursor *string,
) (*entity.SearchLogsResult, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResLogs, auth.ActView); err != nil {
		return nil, err
	}

	startDate, err := time.Parse(time.RFC3339, filters.StartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start date: %w", err)
	}

	var endDate time.Time
	if filters.EndDate != nil {
		endDate, err = time.Parse(time.RFC3339, *filters.EndDate)
		if err != nil {
			return nil, fmt.Errorf("invalid end date: %w", err)
		}
	} else {
		endDate = time.Now()
	}

	options := &entity.SearchLogsOptions{
		Cursor:         cursor,
		StartDate:      startDate,
		EndDate:        endDate,
		Search:         filters.Search,
		NodeIDs:        filters.NodeIDs,
		Levels:         filters.Levels,
		VersionsIDs:    filters.VersionsIDs,
		WorkflowsNames: filters.WorkflowsNames,
	}

	return i.nodeLogRepo.PaginatedSearch(ctx, runtimeId, options)
}

func (i *VersionInteractor) setStatusError(
	ctx context.Context,
	runtimeId string,
	version *entity.Version,
	errors []error,
	notifyCh chan *entity.Version,
) {
	errorMessages := make([]string, len(errors))
	for idx, err := range errors {
		errorMessages[idx] = err.Error()
	}

	i.logger.Errorf("The version \"%s\" has the following errors: %s", version.Name, strings.Join(errorMessages, "\n"))
	versionWithError, err := i.versionRepo.SetErrors(ctx, runtimeId, version, errorMessages)
	if err != nil {
		i.logger.Errorf("error saving version error state: %s", err)
	}

	notifyCh <- versionWithError
}
