package usecase

import (
	"context"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path"
	"time"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/repository"
	"github.com/konstellation-io/kre/admin/admin-api/domain/service"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/krt"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/version"
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
	// ErrUpdatingRunningVersionConfig error
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
	monitoringService      service.MonitoringService
	userActivityInteractor UserActivityInteracter
	accessControl          auth.AccessControl
	idGenerator            version.IDGenerator
	docGenerator           version.DocGenerator
	dashboardService       service.DashboardService
}

// NewVersionInteractor creates a new interactor
func NewVersionInteractor(
	cfg *config.Config,
	logger logging.Logger,
	versionRepo repository.VersionRepo,
	runtimeRepo repository.RuntimeRepo,
	runtimeService service.VersionService,
	monitoringService service.MonitoringService,
	userActivityInteractor UserActivityInteracter,
	accessControl auth.AccessControl,
	idGenerator version.IDGenerator,
	docGenerator version.DocGenerator,
	dashboardService service.DashboardService,
) *VersionInteractor {
	return &VersionInteractor{
		cfg,
		logger,
		versionRepo,
		runtimeRepo,
		runtimeService,
		monitoringService,
		userActivityInteractor,
		accessControl,
		idGenerator,
		docGenerator,
		dashboardService,
	}
}

func (i *VersionInteractor) filterConfigVars(loggedUserID string, version *entity.Version) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		version.Config.Vars = nil
	}
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

// GetByID returns a Version by its ID
func (i *VersionInteractor) GetByID(loggedUserID, id string) (*entity.Version, error) {
	v, err := i.versionRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	i.filterConfigVars(loggedUserID, v)

	return v, nil
}

func (i *VersionInteractor) GetByIDs(ids []string) ([]*entity.Version, []error) {
	return i.versionRepo.GetByIDs(ids)
}

func (i *VersionInteractor) copyStreamToTempFile(krtFile io.Reader) (*os.File, error) {
	tmpFile, err := ioutil.TempFile("", "version")

	if err != nil {
		return nil, fmt.Errorf("error creating temp file for version: %w", err)
	}

	_, err = io.Copy(tmpFile, krtFile)
	i.logger.Infof("Created temp file: %s", tmpFile.Name())

	return tmpFile, nil
}

// Create creates a Version on the DB based on the content of a KRT file
func (i *VersionInteractor) Create(ctx context.Context, loggedUserID, runtimeID string, krtFile io.Reader) (*entity.Version, chan *entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(ctx, runtimeID)
	if err != nil {
		return nil, nil, fmt.Errorf("error runtime repo GetByID: %w", err)
	}

	// Check if the version is duplicated
	versions, err := i.versionRepo.GetByRuntime(runtimeID)
	if err != nil {
		return nil, nil, fmt.Errorf("error checking duplicated version: %w", err)
	}

	tmpDir, err := ioutil.TempDir("", "version")
	if err != nil {
		return nil, nil, fmt.Errorf("error creating temp dir for version: %w", err)
	}
	i.logger.Info("Created temp dir to extract the KRT files at " + tmpDir)

	tmpKrtFile, err := i.copyStreamToTempFile(krtFile)
	if err != nil {
		return nil, nil, fmt.Errorf("error creating temp krt file for version: %w", err)
	}

	krtYml, err := krt.ProcessYaml(i.logger, tmpKrtFile.Name(), tmpDir)
	if err != nil {
		return nil, nil, err
	}

	for _, v := range versions {
		if v.Name == krtYml.Version {
			return nil, nil, ErrVersionDuplicated
		}
	}

	workflows, err := i.generateWorkflows(krtYml)
	if err != nil {
		return nil, nil, fmt.Errorf("error generating workflows: %w", err)
	}

	existingConfig := readExistingConf(versions)
	cfg := fillNewConfWithExisting(existingConfig, krtYml)

	versionCreated, err := i.versionRepo.Create(loggedUserID, &entity.Version{
		RuntimeID:   runtimeID,
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

	go func() {
		asyncCtx := context.Background()
		defer func() {
			err = tmpKrtFile.Close()
			if err != nil {
				i.logger.Errorf("error closing file: %s", err)
				return
			}

			err = os.Remove(tmpKrtFile.Name())
			if err != nil {
				i.logger.Errorf("error removing file: %s", err)
			}
		}()

		contentErrors := krt.ProcessContent(i.logger, krtYml, tmpKrtFile.Name(), tmpDir)
		if len(contentErrors) > 0 {
			errorMessage := "error processing krt"
			i.logger.Errorf("%s: %s", errorMessage, err)
			contentErrors = append([]error{fmt.Errorf(errorMessage)}, contentErrors...)
		}

		dashboardsFolder := path.Join(tmpDir, "metrics/dashboards")
		if _, err := os.Stat(path.Join(dashboardsFolder)); err == nil {
			err := i.storeDashboards(ctx, runtime, dashboardsFolder, versionCreated.Name)
			if err != nil {
				errorMessage := "error creating dashboard"
				i.logger.Errorf("%s: %s", errorMessage, err)
				contentErrors = append(contentErrors, fmt.Errorf(errorMessage))
			}
		}

		docFolder := path.Join(tmpDir, "docs")
		if _, err := os.Stat(path.Join(docFolder, "README.md")); err == nil {
			err = i.docGenerator.Generate(versionCreated.ID, docFolder)
			if err != nil {
				errorMessage := "error generating version doc"
				i.logger.Errorf("%s: %s", errorMessage, err)
				contentErrors = append(contentErrors, fmt.Errorf(errorMessage))
			}

			err = i.versionRepo.SetHasDoc(asyncCtx, versionCreated.ID, true)
			if err != nil {
				errorMessage := "error updating has doc field"
				i.logger.Errorf("%s: %s", errorMessage, err)
				contentErrors = append(contentErrors, fmt.Errorf(errorMessage))
			}
		} else {
			i.logger.Infof("No documentation found inside the krt files")
		}

		err = i.versionRepo.UploadKRTFile(versionCreated, tmpKrtFile.Name())
		if err != nil {
			errorMessage := "error storing KRT file"
			i.logger.Errorf("%s: %s", errorMessage, err)
			contentErrors = append([]error{errors.New(errorMessage)}, contentErrors...)
		}

		if len(contentErrors) > 0 {
			i.setStatusError(asyncCtx, versionCreated, contentErrors, notifyStatusCh)
			return
		}

		err = i.versionRepo.SetStatus(asyncCtx, versionCreated.ID, entity.VersionStatusCreated)
		if err != nil {
			i.logger.Errorf("error setting version status: %s", err)

			return
		}

		// Notify state
		versionCreated.Status = entity.VersionStatusCreated
		notifyStatusCh <- versionCreated

		err = i.userActivityInteractor.RegisterCreateAction(loggedUserID, runtime, versionCreated)
		if err != nil {
			i.logger.Errorf("error registering activity: %s", err)

			return
		}
	}()

	return versionCreated, notifyStatusCh, nil
}

func (i *VersionInteractor) generateWorkflows(krtYml *krt.Krt) ([]*entity.Workflow, error) {
	var workflows []*entity.Workflow
	if len(krtYml.Workflows) == 0 {
		return workflows, nil
	}
	nodesMap := map[string]krt.Node{}
	for _, n := range krtYml.Nodes {
		nodesMap[n.Name] = n
	}

	for _, w := range krtYml.Workflows {
		var nodes []entity.Node
		var edges []entity.Edge

		var previousN *entity.Node
		for _, name := range w.Sequential {
			nodeInfo, ok := nodesMap[name]
			if !ok {
				return nil, fmt.Errorf("error creating workflows. Node '%s' not found", name)
			}

			node := &entity.Node{
				ID:    i.idGenerator.NewID(),
				Name:  name,
				Image: nodeInfo.Image,
				Src:   nodeInfo.Src,
				GPU:   nodeInfo.GPU,
			}

			if previousN != nil {
				e := entity.Edge{
					ID:       i.idGenerator.NewID(),
					FromNode: previousN.ID,
					ToNode:   node.ID,
				}
				edges = append(edges, e)
			}

			nodes = append(nodes, *node)
			previousN = node
		}

		workflows = append(workflows, &entity.Workflow{
			ID:         i.idGenerator.NewID(),
			Name:       w.Name,
			Entrypoint: w.Entrypoint,
			Nodes:      nodes,
			Edges:      edges,
		})
	}
	return workflows, nil
}

// Start create the resources of the given Version
func (i *VersionInteractor) Start(
	ctx context.Context,
	loggedUserID string,
	versionID string,
	comment string,
) (*entity.Version, chan *entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, nil, err
	}

	i.logger.Infof("The user %s is starting version %s", loggedUserID, versionID)

	v, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, nil, err
	}

	if !v.CanBeStarted() {
		return nil, nil, ErrInvalidVersionStatusBeforeStarting
	}

	if !v.Config.Completed {
		return nil, nil, ErrVersionConfigIncomplete
	}

	runtime, err := i.runtimeRepo.GetByID(ctx, v.RuntimeID)
	if err != nil {
		return nil, nil, err
	}

	notifyStatusCh := make(chan *entity.Version, 1)

	err = i.versionRepo.SetStatus(ctx, v.ID, entity.VersionStatusStarting)
	if err != nil {
		return nil, nil, err
	}

	// Notify intermediate state
	v.Status = entity.VersionStatusStarting
	notifyStatusCh <- v

	err = i.userActivityInteractor.RegisterStartAction(loggedUserID, runtime, v, comment)
	if err != nil {
		return nil, nil, err
	}

	go i.changeStatusAndNotify(runtime, v, entity.VersionStatusStarted, notifyStatusCh)

	return v, notifyStatusCh, nil
}

// Stop removes the resources of the given Version
func (i *VersionInteractor) Stop(
	ctx context.Context,
	loggedUserID string,
	versionID string,
	comment string,
) (*entity.Version, chan *entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, nil, err
	}

	i.logger.Infof("The user %s is stopping version %s", loggedUserID, versionID)

	v, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, nil, err
	}

	if !v.CanBeStopped() {
		return nil, nil, ErrInvalidVersionStatusBeforeStopping
	}

	runtime, err := i.runtimeRepo.GetByID(ctx, v.RuntimeID)
	if err != nil {
		return nil, nil, err
	}

	err = i.versionRepo.SetStatus(ctx, v.ID, entity.VersionStatusStopping)
	if err != nil {
		return nil, nil, err
	}

	notifyStatusCh := make(chan *entity.Version, 1)

	// Notify intermediate state
	v.Status = entity.VersionStatusStopping
	notifyStatusCh <- v

	err = i.userActivityInteractor.RegisterStopAction(loggedUserID, runtime, v, comment)
	if err != nil {
		return nil, nil, err
	}

	go i.changeStatusAndNotify(runtime, v, entity.VersionStatusStopped, notifyStatusCh)

	return v, notifyStatusCh, nil
}

func (i *VersionInteractor) changeStatusAndNotify(
	runtime *entity.Runtime,
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
		err := i.versionService.Start(ctx, runtime, version)
		if err != nil {
			i.logger.Errorf("[versionInteractor.changeStatusAndNotify] error setting version status '%s'[status:%s]: %s", version.Name, status, err)
		}
	}

	if status == entity.VersionStatusStopped {
		err := i.versionService.Stop(ctx, runtime, version)
		if err != nil {
			i.logger.Errorf("[versionInteractor.changeStatusAndNotify] error setting version status '%s'[status:%s]: %s", version.Name, status, err)
		}
	}

	err := i.versionRepo.SetStatus(ctx, version.ID, status)
	if err != nil {
		i.logger.Errorf("[versionInteractor.Start] error setting version status '%s'[status:%s]: %s", version.Name, status, err)
	}
	version.Status = status
	notifyStatusCh <- version
	i.logger.Infof("[versionInteractor.Start] '%s' version status changed to %s", version.Name, status)

}

// Publish set a Version as published on DB and K8s
func (i *VersionInteractor) Publish(ctx context.Context, loggedUserID string, versionID string, comment string) (*entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, err
	}

	i.logger.Infof("The user %s is publishing version %s", loggedUserID, versionID)

	v, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, err
	}

	if v.Status != entity.VersionStatusStarted {
		return nil, ErrInvalidVersionStatusBeforePublishing
	}

	runtime, err := i.runtimeRepo.GetByID(ctx, v.RuntimeID)
	if err != nil {
		return nil, err
	}

	// Unpublish previous published version
	previousPublishedVersion := &entity.Version{}
	if runtime.PublishedVersion != "" {
		previousPublishedVersion, err = i.unpublishPreviousVersion(runtime)
		if err != nil {
			return nil, fmt.Errorf("error unpublishing previous version: %w", err)
		}
	}

	err = i.versionService.Publish(runtime, v)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	v.PublicationDate = &now
	v.PublicationUserID = &loggedUserID
	v.Status = entity.VersionStatusPublished
	err = i.versionRepo.Update(v)
	if err != nil {
		return nil, err
	}

	err = i.runtimeRepo.UpdatePublishedVersion(ctx, runtime.ID, v.ID)
	if err != nil {
		return nil, err
	}

	err = i.userActivityInteractor.RegisterPublishAction(loggedUserID, runtime, v, previousPublishedVersion, comment)
	if err != nil {
		return nil, err
	}

	return v, nil
}

func (i *VersionInteractor) unpublishPreviousVersion(runtime *entity.Runtime) (*entity.Version, error) {
	v, err := i.versionRepo.GetByID(runtime.PublishedVersion)
	if err != nil {
		return nil, err
	}

	v.Status = entity.VersionStatusStarted
	v.PublicationUserID = nil
	v.PublicationDate = nil

	err = i.versionRepo.Update(v)
	if err != nil {
		return nil, err
	}

	return v, nil
}

// Unpublish set a Version as not published on DB and K8s
func (i *VersionInteractor) Unpublish(ctx context.Context, loggedUserID string, versionID string, comment string) (*entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, err
	}

	i.logger.Infof("The user %s is unpublishing version %s", loggedUserID, versionID)

	v, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, err
	}

	if v.Status != entity.VersionStatusPublished {
		return nil, ErrInvalidVersionStatusBeforeUnpublishing
	}

	runtime, err := i.runtimeRepo.GetByID(ctx, v.RuntimeID)
	if err != nil {
		return nil, err
	}

	err = i.versionService.Unpublish(runtime, v)
	if err != nil {
		return nil, err
	}

	v.PublicationUserID = nil
	v.PublicationDate = nil
	v.Status = entity.VersionStatusStarted
	err = i.versionRepo.Update(v)
	if err != nil {
		return nil, err
	}

	err = i.runtimeRepo.UpdatePublishedVersion(ctx, runtime.ID, "")
	if err != nil {
		return nil, err
	}

	err = i.userActivityInteractor.RegisterUnpublishAction(loggedUserID, runtime, v, comment)
	if err != nil {
		return nil, err
	}

	return v, nil
}

func (i *VersionInteractor) UpdateVersionConfig(ctx context.Context, loggedUserID string, version *entity.Version, config []*entity.ConfigurationVariable) (*entity.Version, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActEdit); err != nil {
		return nil, err
	}

	err := i.validateNewConfig(version.Config.Vars, config)
	if err != nil {
		return nil, err
	}

	isStarted := version.PublishedOrStarted()

	newConfig, newConfigIsComplete := generateNewConfig(version.Config.Vars, config)

	if isStarted && newConfigIsComplete == false {
		return nil, ErrUpdatingStartedVersionConfig
	}

	version.Config.Vars = newConfig
	version.Config.Completed = newConfigIsComplete

	runtime, err := i.runtimeRepo.GetByID(ctx, version.RuntimeID)
	if err != nil {
		return nil, err
	}

	// No need to call runtime-api if there are no resources running
	if isStarted {
		err = i.versionService.UpdateConfig(runtime, version)
		if err != nil {
			return nil, err
		}
	}

	err = i.versionRepo.Update(version)
	if err != nil {
		return nil, err
	}

	return version, nil
}

func (i *VersionInteractor) WatchNodeStatus(ctx context.Context, loggedUserID, versionId string) (<-chan *entity.Node, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResVersion, auth.ActView); err != nil {
		return nil, err
	}

	v, err := i.versionRepo.GetByID(versionId)
	if err != nil {
		return nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(ctx, v.RuntimeID)
	if err != nil {
		return nil, err
	}

	return i.monitoringService.WatchNodeStatus(ctx, runtime, v.Name)
}

func (i *VersionInteractor) WatchNodeLogs(
	ctx context.Context,
	loggedUserID, runtimeID, versionID string,
	filters entity.LogFilters,
) (<-chan *entity.NodeLog, error) {
	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResLogs, auth.ActView); err != nil {
		return nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(ctx, runtimeID)
	if err != nil {
		return nil, err
	}

	return i.monitoringService.NodeLogs(ctx, runtime, versionID, filters)
}

func (i *VersionInteractor) SearchLogs(
	ctx context.Context,
	loggedUserID string,
	runtimeID string,
	versionID string,
	filters entity.LogFilters,
	cursor *string,
) (entity.SearchLogsResult, error) {
	var result entity.SearchLogsResult

	if err := i.accessControl.CheckPermission(loggedUserID, auth.ResLogs, auth.ActView); err != nil {
		return result, err
	}

	runtime, err := i.runtimeRepo.GetByID(ctx, runtimeID)
	if err != nil {
		return result, err
	}

	return i.monitoringService.SearchLogs(ctx, runtime, versionID, filters, cursor)
}

func (i *VersionInteractor) setStatusError(ctx context.Context, version *entity.Version, errors []error, notifyCh chan *entity.Version) {
	errorMessages := make([]string, len(errors))
	for idx, err := range errors {
		errorMessages[idx] = err.Error()
	}

	versionWithError, err := i.versionRepo.SetErrors(ctx, version, errorMessages)
	if err != nil {
		i.logger.Errorf("error saving version error state: %s", err)
	}

	notifyCh <- versionWithError
}
