package usecase

import (
	"fmt"

	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/krt"
)

func generateWorkflows(krtYml *krt.Krt) ([]*entity.Workflow, error) {
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
				ID:    generateId(),
				Name:  name,
				Image: nodeInfo.Image,
				Src:   nodeInfo.Src,
			}

			if previousN != nil {
				e := entity.Edge{
					ID:       generateId(),
					FromNode: previousN.ID,
					ToNode:   node.ID,
				}
				edges = append(edges, e)
			}

			nodes = append(nodes, *node)
			previousN = node
		}

		workflows = append(workflows, &entity.Workflow{
			ID:         generateId(),
			Name:       w.Name,
			Entrypoint: w.Entrypoint,
			Nodes:      nodes,
			Edges:      edges,
		})
	}
	return workflows, nil
}
