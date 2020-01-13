package usecase

import (
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
)

// VersionStatus enum of the statuses
type VersionStatus string

var (
	VersionStatusCreating VersionStatus = "CREATING"
	VersionStatusRunning  VersionStatus = "RUNNING"
	VersionStatusError    VersionStatus = "ERROR"
)

var AllVersionStatus = []VersionStatus{
	VersionStatusCreating,
	VersionStatusRunning,
	VersionStatusError,
}

type VersionInteractor struct {
	logger          logging.Logger
	resourceManager service.ResourceManagerService
}

func NewVersionInteractor(
	logger logging.Logger,
	resourceManager service.ResourceManagerService,
) *VersionInteractor {
	return &VersionInteractor{
		logger,
		resourceManager,
	}
}

func (i *VersionInteractor) DeployVersion(version *entity.Version) (*entity.Version, error) {
	i.logger.Info(fmt.Sprintf("Deploying version: %s", version.Name))
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
	err := i.resourceManager.CreateEntrypoint(version)
	if err != nil {
		i.logger.Error(err.Error())
		return nil, err
	}

	version.Status = string(VersionStatusCreating)

	return version, err
}

func (i *VersionInteractor) generateNodeConfig(version *entity.Version, workflow *entity.Workflow) {
	for _, n := range workflow.Nodes {
		n.Config = map[string]string{
			"KRT_VERSION":           version.Name,
			"KRT_NODE_NAME":         n.Name,
			"KRT_NATS_SERVER":       "kre-nats:4222",
			"KRT_NATS_MONGO_WRITER": "kre-nats:4222",
			"KRT_BASE_PATH":         "/krt-files",
			"KRT_HANDLER_PATH":      n.Src,
		}
	}

	for _, e := range workflow.Edges {
		fromNode := i.getNodeById(workflow.Nodes, e.FromNode)
		toNode := i.getNodeById(workflow.Nodes, e.ToNode)

		fromNode.Config["KRT_NATS_OUTPUT"] = toNode.ID
		toNode.Config["KRT_NATS_INPUT"] = fromNode.ID
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
	firstNode.Config["KRT_NATS_INPUT"] = fmt.Sprintf("%s-entrypoint", strcase.ToKebab(workflow.Entrypoint))

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

func (i *VersionInteractor) ActivateVersion(name string) (*entity.Version, error) {
	err := i.resourceManager.ActivateVersion(name)
	if err != nil {
		return nil, err
	}

	activeVersion := &entity.Version{
		Name:   name,
		Status: string(VersionStatusRunning),
	}

	return activeVersion, err
}
