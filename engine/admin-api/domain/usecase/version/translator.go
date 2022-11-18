package version

import (
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

type Translator struct {
	idGenerator IDGenerator
}

func NewTranslator(idGenerator IDGenerator) Translator {
	return Translator{
		idGenerator,
	}
}

// TranslateToKrtVersionV2 will convert a v1 krt version to v2
func (t Translator) TranslateToKrtVersionV2(version *entity.Version) {
	for _, workflow := range version.Workflows {
		var nodesInWorkflow = make([]entity.Node, 0)
		var allNodeNames = make([]string, 0)
		for idx, node := range workflow.Nodes {
			if idx == 0 { // first node subscribes to entrypoint
				node.Subscriptions = []string{"entrypoint"}
			} else { // rest of nodes subscribe to previous node
				node.Subscriptions = []string{workflow.Nodes[idx-1].Name}
			}
			nodesInWorkflow = append(nodesInWorkflow, node)
			allNodeNames = append(allNodeNames, node.Name)
		}
		exitpoint := t.generateExitpoint(allNodeNames)
		nodesInWorkflow = append(nodesInWorkflow, exitpoint)
		workflow.Nodes = nodesInWorkflow
		workflow.Exitpoint = exitpoint.Name
	}
}

func (t Translator) generateExitpoint(allNodeNames []string) entity.Node {
	return entity.Node{
		ID:            t.idGenerator.NewID(),
		Name:          "konstellation-exitpoint",
		Image:         "konstellation/kre-exitpoint:latest",
		GPU:           false,
		Subscriptions: allNodeNames,
	}
}
