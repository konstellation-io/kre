package version

import (
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

// TranslateToKrtVersionV2 will convert a v1 krt version to v2
func TranslateToKrtVersionV2(version *entity.Version) {
	for _, workflow := range version.Workflows {
		var nodesInWorkflow = make([]entity.Node, 0)
		for idx, node := range workflow.Nodes {
			if idx == 0 { // first node subscribes to entrypoint
				node.Subscriptions = []string{"entrypoint"}
			} else { // rest of nodes subscribe to previous node
				node.Subscriptions = []string{workflow.Nodes[idx-1].Name}
			}
			nodesInWorkflow = append(nodesInWorkflow, node)
		}
		workflow.Nodes = nodesInWorkflow
		workflow.ExitPoint = workflow.Nodes[len(workflow.Nodes)-1].Name
	}
	// TODO exitpoint is our dummy exitpoint
}
