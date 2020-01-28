package usecase

import (
	"context"
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
)

type VersionInteractor struct {
	logger           logging.Logger
	resourceManager  service.ResourceManagerService
	logStreamService service.LogStreamService
}

func NewVersionInteractor(
	logger logging.Logger,
	resourceManager service.ResourceManagerService,
	logStreamService service.LogStreamService,
) *VersionInteractor {
	return &VersionInteractor{
		logger,
		resourceManager,
		logStreamService,
	}
}

func (i *VersionInteractor) StartVersion(version *entity.Version) (*entity.Version, error) {
	i.logger.Info(fmt.Sprintf("Starting version: %s", version.Name))

	// TODO: Refactor to avoid modifying Config with pointers, collect to new struct instead
	for _, w := range version.Workflows {
		i.logger.Info(fmt.Sprintf("Processing workflow %s", w.Name))
		i.generateNodeConfig(version, &w)
		for _, n := range w.Nodes {
			err := i.resourceManager.CreateNode(version, n)
			if err != nil {
				i.logger.Error(err.Error())
				return nil, err
			}
		}
	}

	i.generateEntrypointConfig(version)

	_, err := i.resourceManager.CreateVersionConfig(version)
	if err != nil {
		return nil, err
	}

	err = i.resourceManager.CreateEntrypoint(version)
	if err != nil {
		i.logger.Error(err.Error())
		return nil, err
	}

	return version, err
}

func (i *VersionInteractor) generateEntrypointConfig(version *entity.Version) {
	natsSubjects := map[string]string{}

	for _, w := range version.Workflows {
		natsSubjects[w.Entrypoint] = w.Nodes[0].Config["KRT_NATS_INPUT"]
	}

	version.Entrypoint.Config = map[string]interface{}{
		"nats-subjects": natsSubjects,
	}
}

func (i *VersionInteractor) generateNodeConfig(version *entity.Version, workflow *entity.Workflow) {
	for _, n := range workflow.Nodes {
		n.Config = map[string]string{
			"KRT_VERSION":           version.Name,
			"KRT_NODE_NAME":         n.Name,
			"KRT_NATS_SERVER":       "kre-nats:4222",
			"KRT_NATS_MONGO_WRITER": "some_channel",
			"KRT_BASE_PATH":         "/krt-files",
			"KRT_HANDLER_PATH":      n.Src,
		}
	}

	for _, e := range workflow.Edges {
		fromNode := i.getNodeById(workflow.Nodes, e.FromNode)
		toNode := i.getNodeById(workflow.Nodes, e.ToNode)

		fromNode.Config["KRT_NATS_OUTPUT"] = e.ID
		toNode.Config["KRT_NATS_INPUT"] = e.ID
	}

	var firstNode *entity.Node
	var lastNode *entity.Node
	totalEdges := len(workflow.Edges)

	if totalEdges == 0 {
		firstNode = workflow.Nodes[0]
		lastNode = workflow.Nodes[0]
	} else {
		firstNode = i.getNodeById(workflow.Nodes, workflow.Edges[0].FromNode)
		lastNode = i.getNodeById(workflow.Nodes, workflow.Edges[len(workflow.Edges)-1].ToNode)
	}

	// First node input is the workflow entrypoint
	firstNode.Config["KRT_NATS_INPUT"] = fmt.Sprintf("%s-%s-entrypoint", strcase.ToKebab(version.Name), strcase.ToKebab(workflow.Entrypoint))

	// Last node output is empty to reply to entrypoint
	lastNode.Config["KRT_NATS_OUTPUT"] = ""
}

func (i *VersionInteractor) getNodeById(nodes []*entity.Node, id string) *entity.Node {
	for _, n := range nodes {
		if n.ID == id {
			return n
		}
	}
	return nil
}

func (i *VersionInteractor) StopVersion(name string) (*entity.Version, error) {
	err := i.resourceManager.StopVersion(name)
	if err != nil {
		return nil, err
	}

	version := &entity.Version{
		Name:   name,
	}

	return version, err
}

func (i *VersionInteractor) UnpublishVersion(name string) (*entity.Version, error) {
	err := i.resourceManager.UnpublishVersion(name)
	if err != nil {
		return nil, err
	}

	version := &entity.Version{
		Name:   name,
	}

	return version, err
}

func (i *VersionInteractor) PublishVersion(name string) (*entity.Version, error) {
	err := i.resourceManager.PublishVersion(name)
	if err != nil {
		return nil, err
	}

	activeVersion := &entity.Version{
		Name:   name,
	}

	return activeVersion, err
}

func (i *VersionInteractor) UpdateVersionConfig(version *entity.Version) error {

	return i.resourceManager.UpdateVersionConfig(version)
}

func (i *VersionInteractor) WatchNodeLogs(ctx context.Context, nodeId string) chan *entity.NodeLog {
	statusCh := make(chan *entity.NodeLog, 1)
	i.logStreamService.WatchNodeLogs(ctx, nodeId, statusCh)

	return statusCh
}

func (i *VersionInteractor) WatchVersionStatus(versionName string) (chan *entity.VersionNodeStatus, chan struct{}) {

	statusCh := make(chan *entity.VersionNodeStatus, 1)
	stopCh := i.resourceManager.WatchVersionNodeStatus(versionName, statusCh)

	return statusCh, stopCh
}
