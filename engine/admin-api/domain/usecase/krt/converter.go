package krt

// convertKrt will convert a v1 krt version to v2
func convertKrt(krt *Krt) {
	if krt.KrtVersion != VersionV1 && krt.KrtVersion != "" {
		return
	}

	var nodesByName = make(map[string]Node)
	for _, node := range krt.Nodes {
		nodesByName[node.Name] = node
	}

	var workflows = make([]Workflow, 0)
	for _, workflow := range krt.Workflows {
		var nodesInWorkflow = make([]Node, 0)
		for idx, seqName := range workflow.Sequential {
			node := nodesByName[seqName]
			if idx == 0 { // first node subscribes to entrypoint
				node.Subscriptions = []string{"entrypoint"}
			} else { // rest of nodes subscribe to previous node
				node.Subscriptions = []string{workflow.Sequential[idx-1]}
			}
			nodesInWorkflow = append(nodesInWorkflow, node)
		}
		workflow.Nodes = nodesInWorkflow
		workflow.ExitPoint = workflow.Sequential[len(workflow.Sequential)-1]
	}
	krt.Workflows = workflows
}
