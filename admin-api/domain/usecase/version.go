package usecase

import (
	"errors"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/repository/minio"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/krt"
	"io"
	"io/ioutil"
	"os"
	"sort"
	"time"

	"github.com/google/uuid"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

// VersionStatus enumeration of Version statuses
type VersionStatus string

var (
	// VersionStatusStarting status
	VersionStatusStarting VersionStatus = "STARTING"
	// VersionStatusStarted status
	VersionStatusStarted VersionStatus = "STARTED"
	// VersionStatusPublished status
	VersionStatusPublished VersionStatus = "PUBLISHED"
	// VersionStatusStopped status
	VersionStatusStopped VersionStatus = "STOPPED"
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
)

// VersionInteractor contains app logic about Version entities
type VersionInteractor struct {
	logger                 logging.Logger
	versionRepo            repository.VersionRepo
	runtimeRepo            repository.RuntimeRepo
	runtimeService         service.RuntimeService
	userActivityInteractor *UserActivityInteractor
	minio                  minio.MinioRepo
}

// NewVersionInteractor creates a new interactor
func NewVersionInteractor(
	logger logging.Logger,
	versionRepo repository.VersionRepo,
	runtimeRepo repository.RuntimeRepo,
	runtimeService service.RuntimeService,
	userActivityInteractor *UserActivityInteractor,
	minioRepo minio.MinioRepo,
) *VersionInteractor {
	return &VersionInteractor{
		logger,
		versionRepo,
		runtimeRepo,
		runtimeService,
		userActivityInteractor,
		minioRepo,
	}
}

// Create creates a Version on the DB based on the content of a KRT file
func (i *VersionInteractor) Create(userID, runtimeID string, krtFile io.Reader) (*entity.Version, error) {
	runtime, err := i.runtimeRepo.GetByID(runtimeID)
	if err != nil {
		return nil, fmt.Errorf("error runtime repo GetByID: %w", err)
	}

	tmpDir, err := ioutil.TempDir("", "version")
	if err != nil {
		return nil, fmt.Errorf("error creating temp dir for version: %w", err)
	}
	i.logger.Info("Created temp dir to extract the KRT files at " + tmpDir)

	krt, err := i.CreateKrtYaml(tmpDir, krtFile)
	if err != nil {
		return nil, fmt.Errorf("error creating krt yaml: %w", err)
	}

	// Check if the version is duplicated
	versions, err := i.versionRepo.GetByRuntime(runtimeID)
	for _, v := range versions {
		if v.Name == krt.Version {
			return nil, ErrVersionDuplicated
		}
	}

	// Parse Workflows
	var workflows []entity.Workflow
	if len(krt.Workflows) > 0 {
		for _, w := range krt.Workflows {
			workflows = append(workflows, i.generateWorkflow(krt.Nodes, w))
		}
	}

	currentConfig := i.getConfigFromPreviousVersions(versions)

	// mark config as completed unless it finds an empty value
	configCompleted := true

	configVars := make([]*entity.ConfigVar, 0)

	for _, cf := range krt.Config.Files {
		val := ""
		if previousVal, ok := currentConfig[cf]; ok {
			val = previousVal
		} else {
			configCompleted = false
		}
		configVars = append(configVars, &entity.ConfigVar{
			Key:   cf,
			Value: val,
			Type:  "FILE",
		})
	}

	for _, cv := range krt.Config.Variables {
		val := ""
		if previousVal, ok := currentConfig[cv]; ok {
			val = previousVal
		} else {
			configCompleted = false
		}
		configVars = append(configVars, &entity.ConfigVar{
			Key:   cv,
			Value: val,
			Type:  "VARIABLE",
		})
	}

	version := &entity.Version{
		RuntimeID:   runtimeID,
		Name:        krt.Version,
		Description: krt.Description,
		Config: entity.VersionConfig{
			Vars:      configVars,
			Completed: configCompleted,
		},
		Entrypoint: entity.Entrypoint{
			ProtoFile: krt.Entrypoint.Proto,
			Image:     krt.Entrypoint.Image,
			Src:       krt.Entrypoint.Src,
		},
		Workflows: workflows,
	}
	versionCreated, err := i.versionRepo.Create(userID, version)
	if err != nil {
		return nil, err
	}
	i.logger.Info("Version created ")

	minioClient, err := i.minio.NewClient(i.logger, runtime)
	if err != nil {
		i.logger.Error(fmt.Sprintf("error Initializing Minio Client for Runtime %s", runtime.Name))
		return nil, fmt.Errorf("error Initializing Minio Client for Runtime %s: %w", runtime.Name, err)
	}
	i.logger.Info(fmt.Sprintf("Minio Client Initialized for Runtime %s", runtime.Name))

	bucket, err := i.minio.CreateBucket(krt.Version, minioClient)
	if err != nil {
		i.logger.Error(fmt.Sprintf("error Creating Bucket for Version %s", krt.Version))
		return nil, fmt.Errorf("error Creating Bucket for Version %s: %w", krt.Version, err)
	}

	i.logger.Info(fmt.Sprintf("Bucket Created for Version %s", runtime.Name))

	err = bucket.CopyDir(tmpDir, minioClient)
	if err != nil {
		i.logger.Error(fmt.Sprintf("error Copying dir %s", tmpDir))
		return nil, fmt.Errorf("error Copying dir %s: %w", tmpDir, err)
	}

	i.logger.Info(fmt.Sprintf("Dir %s Copied ", tmpDir))

	// Remove KRT file and tmpDir
	err = os.RemoveAll(tmpDir)
	if err != nil {
		i.logger.Error(fmt.Sprintf("error Removing dir %s", tmpDir))
		return nil, fmt.Errorf("error Removing dir %s: %w", tmpDir, err)
	}

	i.logger.Info(fmt.Sprintf("Dir %s Removed ", tmpDir))

	err = i.userActivityInteractor.Create(
		userID,
		UserActivityTypeCreateVersion,
		[]entity.UserActivityVar{
			{
				Key:   "RUNTIME_ID",
				Value: runtime.ID,
			},
			{
				Key:   "RUNTIME_NAME",
				Value: runtime.Name,
			},
			{
				Key:   "VERSION_ID",
				Value: versionCreated.ID,
			},
			{
				Key:   "VERSION_NAME",
				Value: versionCreated.Name,
			},
		})

	if err != nil {
		i.logger.Error("error creating userActivity")
		return nil, fmt.Errorf("error creating userActivity: %w", err)
	}

	return versionCreated, nil
}

func (i *VersionInteractor) CreateKrtYaml(tmpDir string, krtFile io.Reader) (*krt.Krt, error) {
	return krt.CreateKrtYaml(i.logger, tmpDir, krtFile)
}

func (i *VersionInteractor) getNodeByName(nodes []krt.KrtNode, name string) (*krt.KrtNode, error) {
	for _, n := range nodes {
		if n.Name == name {
			return &n, nil
		}
	}
	return nil, errors.New(fmt.Sprintf("Node '%s' not found in node list", name))
}

func (i *VersionInteractor) getConfigFromPreviousVersions(versions []entity.Version) map[string]string {
	currentConfig := map[string]string{}

	if len(versions) == 0 {
		return currentConfig
	}

	// Sort version list by creation date descending
	sort.Slice(versions, func(i, j int) bool {
		return versions[i].CreationDate.Unix() < versions[j].CreationDate.Unix()
	})

	for _, v := range versions {
		for _, c := range v.Config.Vars {
			if c.Value != "" {
				currentConfig[c.Key] = c.Value
			}
		}
	}

	return currentConfig
}

func (i *VersionInteractor) generateWorkflow(krtNodes []krt.KrtNode, w krt.KrtWorkflow) entity.Workflow {
	var nodes []entity.Node
	var edges []entity.Edge

	var previousN *entity.Node
	for _, name := range w.Sequential {
		nodeInfo, err := i.getNodeByName(krtNodes, name)
		if err != nil || nodeInfo == nil {
			// TODO: HANDLE ERROR ON NODES WITH UNKNOWN NAMES
		}
		i.logger.Warn(fmt.Sprintf("NODE %#v", nodeInfo))

		node := &entity.Node{
			ID:     uuid.New().String(),
			Name:   name,
			Image:  nodeInfo.Image,
			Src:    nodeInfo.Src,
			Status: "STOPPED", // TODO get status using runtime-api or k8s
		}

		if previousN != nil {
			e := entity.Edge{
				ID:       uuid.New().String(),
				FromNode: previousN.ID,
				ToNode:   node.ID,
			}
			edges = append(edges, e)
		}

		nodes = append(nodes, *node)
		previousN = node
	}

	return entity.Workflow{
		Name:       w.Name,
		Entrypoint: w.Entrypoint,
		Nodes:      nodes,
		Edges:      edges,
	}
}

// Start create the resources of the given Version
func (i *VersionInteractor) Start(userID string, versionID string) (*entity.Version, error) {
	i.logger.Info(fmt.Sprintf("The user %s is starting version %s", userID, versionID))

	version, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, err
	}

	i.logger.Info(fmt.Sprintf("Checking version config: %#v", version.Config))
	if !version.Config.Completed {
		return nil, ErrVersionConfigIncomplete
	}

	runtime, err := i.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, err
	}

	err = i.runtimeService.StartVersion(runtime, version)
	if err != nil {
		return nil, err
	}

	version.Status = string(VersionStatusStarted) // TODO: First go to Starting
	err = i.versionRepo.Update(version)
	if err != nil {
		return nil, err
	}

	err = i.userActivityInteractor.Create(
		userID,
		UserActivityTypeStartVersion,
		[]entity.UserActivityVar{
			{
				Key:   "RUNTIME_ID",
				Value: runtime.ID,
			},
			{
				Key:   "RUNTIME_NAME",
				Value: runtime.Name,
			},
			{
				Key:   "VERSION_ID",
				Value: version.ID,
			},
			{
				Key:   "VERSION_NAME",
				Value: version.Name,
			},
		})
	if err != nil {
		return nil, err
	}

	return version, nil
}

// Stop removes the resources of the given Version
func (i *VersionInteractor) Stop(userID string, versionID string) (*entity.Version, error) {
	i.logger.Info(fmt.Sprintf("The user %s is stopping version %s", userID, versionID))

	version, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, err
	}

	err = i.runtimeService.StopVersion(runtime, version.Name)
	if err != nil {
		return nil, err
	}

	version.Status = string(VersionStatusStopped)
	err = i.versionRepo.Update(version)
	if err != nil {
		return nil, err
	}

	err = i.userActivityInteractor.Create(
		userID,
		UserActivityTypeStopVersion,
		[]entity.UserActivityVar{
			{
				Key:   "RUNTIME_ID",
				Value: runtime.ID,
			},
			{
				Key:   "RUNTIME_NAME",
				Value: runtime.Name,
			},
			{
				Key:   "VERSION_ID",
				Value: version.ID,
			},
			{
				Key:   "VERSION_NAME",
				Value: version.Name,
			},
		})
	if err != nil {
		return nil, err
	}

	return version, nil
}

// Publish set a Version as published on DB and K8s
func (i *VersionInteractor) Publish(userID string, versionID string, comment string) (*entity.Version, error) {
	i.logger.Info(fmt.Sprintf("The user %s is publishing version %s", userID, versionID))

	version, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, err
	}

	// Unpublish previous published version
	previousPublishedVersion := entity.Version{}
	versions, err := i.versionRepo.GetByRuntime(runtime.ID)
	if err != nil {
		return nil, err
	}
	if len(versions) > 0 {
		for _, v := range versions {
			if v.Status == string(VersionStatusPublished) {
				previousPublishedVersion = v
				v.Status = string(VersionStatusStarted)
				v.PublicationUserID = nil
				v.PublicationDate = nil
				err = i.versionRepo.Update(&v)
				if err != nil {
					return nil, err
				}
				break
			}
		}
	}

	err = i.runtimeService.PublishVersion(runtime, version.Name)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	version.PublicationDate = &now
	version.PublicationUserID = &userID
	version.Status = string(VersionStatusPublished)
	err = i.versionRepo.Update(version)
	if err != nil {
		return nil, err
	}

	err = i.userActivityInteractor.Create(
		userID,
		UserActivityTypePublishVersion,
		[]entity.UserActivityVar{
			{
				Key:   "RUNTIME_ID",
				Value: runtime.ID,
			},
			{
				Key:   "RUNTIME_NAME",
				Value: runtime.Name,
			},
			{
				Key:   "VERSION_ID",
				Value: version.ID,
			},
			{
				Key:   "VERSION_NAME",
				Value: version.Name,
			},
			{
				Key:   "OLD_PUBLISHED_VERSION_ID",
				Value: previousPublishedVersion.ID,
			},
			{
				Key:   "OLD_PUBLISHED_VERSION_NAME",
				Value: previousPublishedVersion.Name,
			},
			{
				Key:   "COMMENT",
				Value: comment,
			},
		})
	if err != nil {
		return nil, err
	}

	return version, nil
}

// Unpublish set a Version as not published on DB and K8s
func (i *VersionInteractor) Unpublish(userID string, versionID string) (*entity.Version, error) {
	i.logger.Info(fmt.Sprintf("The user %s is unpublishing version %s", userID, versionID))

	version, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, err
	}

	err = i.runtimeService.UnpublishVersion(runtime, version.Name)
	if err != nil {
		return nil, err
	}

	version.PublicationUserID = nil
	version.PublicationDate = nil
	version.Status = string(VersionStatusStarted)
	err = i.versionRepo.Update(version)
	if err != nil {
		return nil, err
	}

	err = i.userActivityInteractor.Create(
		userID,
		UserActivityTypeUnpublishVersion,
		[]entity.UserActivityVar{
			{
				Key:   "RUNTIME_ID",
				Value: runtime.ID,
			},
			{
				Key:   "RUNTIME_NAME",
				Value: runtime.Name,
			},
			{
				Key:   "VERSION_ID",
				Value: version.ID,
			},
			{
				Key:   "VERSION_NAME",
				Value: version.Name,
			},
		})
	if err != nil {
		return nil, err
	}

	return version, nil
}

func (i *VersionInteractor) versionIsPublishedOrStarted(version *entity.Version) bool {
	switch version.Status {
	case string(VersionStatusStarted), string(VersionStatusPublished):
		return true
	}
	return false
}

func (i *VersionInteractor) getConfigFromList(list []*entity.ConfigVar, key string) *entity.ConfigVar {
	for _, c := range list {
		if c.Key == key {
			return c
		}
	}
	return nil
}

func (i *VersionInteractor) validateNewConfig(currentConfig, newValues []*entity.ConfigVar) error {
	for _, c := range newValues {
		nc := i.getConfigFromList(currentConfig, c.Key)
		if nc == nil {
			return ErrVersionConfigInvalidKey
		}
	}
	return nil
}

func (i *VersionInteractor) generateNewConfig(currentConfig, newValues []*entity.ConfigVar) ([]*entity.ConfigVar, bool) {
	isComplete := false

	// Only get values that already exists on currentConfig
	configToUpdate := make([]*entity.ConfigVar, len(currentConfig))
	totalValues := 0
	for x, c := range currentConfig {
		configToUpdate[x] = c
		nc := i.getConfigFromList(newValues, c.Key)
		if nc == nil {
			if configToUpdate[x].Value != "" {
				totalValues += 1
			}
			continue
		}
		nc.Type = c.Type
		configToUpdate[x] = nc
		if nc.Value != "" {
			totalValues += 1
		}
	}
	if len(currentConfig) == totalValues {
		isComplete = true
	}
	return configToUpdate, isComplete
}

func (i *VersionInteractor) UpdateVersionConfig(version *entity.Version, config []*entity.ConfigVar) (*entity.Version, error) {
	err := i.validateNewConfig(version.Config.Vars, config)
	if err != nil {
		return nil, err
	}

	isStarted := i.versionIsPublishedOrStarted(version)

	newConfig, newConfigIsComplete := i.generateNewConfig(version.Config.Vars, config)

	if isStarted && newConfigIsComplete == false {
		return nil, ErrUpdatingStartedVersionConfig
	}

	version.Config.Vars = newConfig
	version.Config.Completed = newConfigIsComplete

	runtime, err := i.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, err
	}

	// No need to call runtime-api if there are no resources running
	if isStarted {
		err = i.runtimeService.UpdateVersionConfig(runtime, version)
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

// GetByRuntime returns all Versions of the given Runtime
func (i *VersionInteractor) GetByRuntime(runtimeID string) ([]entity.Version, error) {
	return i.versionRepo.GetByRuntime(runtimeID)
}

// GetByID returns a Version by its ID
func (i *VersionInteractor) GetByID(id string) (*entity.Version, error) {
	return i.versionRepo.GetByID(id)
}

func (i *VersionInteractor) WatchVersionStatus(versionId string, stopCh <-chan bool) (<-chan *entity.VersionNodeStatus, error) {
	version, err := i.versionRepo.GetByID(versionId)
	if err != nil {
		return nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, err
	}

	return i.runtimeService.WatchVersionStatus(runtime, version.Name, stopCh)
}

func (i *VersionInteractor) WatchNodeLogs(runtimeID, nodeID string,
	stopChannel chan bool) (<-chan *entity.NodeLog, error) {

	runtime, err := i.runtimeRepo.GetByID(runtimeID)
	if err != nil {
		return nil, err
	}

	return i.runtimeService.WatchNodeLogs(runtime, nodeID, stopChannel)
}
