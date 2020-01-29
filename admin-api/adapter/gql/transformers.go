package gql

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"time"
)

func toGQLUser(user *entity.User) (gqlUser *User) {
	if user == nil {
		return
	}

	return &User{
		ID:    user.ID,
		Email: user.Email,
	}
}

func toGQLRuntime(runtime *entity.Runtime, creationAuthor *entity.User) (gqlRuntime *Runtime) {
	if runtime == nil {
		return
	}

	gqlRuntime = &Runtime{
		ID:             runtime.ID,
		Name:           runtime.Name,
		Status:         RuntimeStatus(runtime.Status),
		CreationDate:   runtime.CreationDate.Format(time.RFC3339),
		CreationAuthor: toGQLUser(creationAuthor),
	}

	return
}

func toGQLVersion(version *entity.Version, creationUser *entity.User, publicationUser *entity.User) (gqlVersion *Version) {
	if version == nil {
		return
	}

	gqlVersion = &Version{
		ID:             version.ID,
		Name:           version.Name,
		Description:    "",
		Status:         VersionStatus(version.Status),
		CreationDate:   version.CreationDate.Format(time.RFC3339),
		CreationAuthor: toGQLUser(creationUser),
	}

	if publicationUser != nil {
		gqlVersion.PublicationAuthor = toGQLUser(publicationUser)
	}

	if version.PublicationDate != nil {
		publicationDate := version.PublicationDate.Format(time.RFC3339)
		gqlVersion.PublicationDate = &publicationDate
	}

	if len(version.Workflows) > 0 {
		var gqlWorkflows []*Workflow
		for _, w := range version.Workflows {
			gqlWorkflows = append(gqlWorkflows, toGQLWorkflow(&w))
		}
		gqlVersion.Workflows = gqlWorkflows
	}
	gqlVersion.ConfigurationVariables = make([]*ConfigurationVariable, len(version.Config.Vars))
	for i, c := range version.Config.Vars {
		gqlVersion.ConfigurationVariables[i] = &ConfigurationVariable{
			Key:   c.Key,
			Value: c.Value,
		}

		switch c.Type {
		case string(ConfigurationVariableTypeVariable):
			gqlVersion.ConfigurationVariables[i].Type = ConfigurationVariableTypeVariable
		case string(ConfigurationVariableTypeFile):
			gqlVersion.ConfigurationVariables[i].Type = ConfigurationVariableTypeFile
		}
	}
	gqlVersion.ConfigurationCompleted = version.Config.Completed

	return
}

func toGQLWorkflow(w *entity.Workflow) *Workflow {
	if w == nil {
		return nil
	}

	var nodes []*Node
	if len(w.Nodes) > 0 {
		for _, n := range w.Nodes {
			nodes = append(nodes, toGQLNode(&n))
		}
	}

	var edges []*Edge
	if len(w.Edges) > 0 {
		for _, e := range w.Edges {
			edges = append(edges, toGQLEdge(&e))
		}
	}

	return &Workflow{
		Name:  w.Name,
		Nodes: nodes,
		Edges: edges,
	}
}

func toGQLNode(n *entity.Node) *Node {
	return &Node{
		ID:     n.ID,
		Name:   n.Name,
		Status: NodeStatus(n.Status),
	}
}

func toGQLEdge(e *entity.Edge) *Edge {
	return &Edge{
		ID:       e.ID,
		FromNode: e.FromNode,
		ToNode:   e.ToNode,
	}
}

func toGQLUserActivityVars(vars []entity.UserActivityVar) []*UserActivityVar {
	var result []*UserActivityVar
	for _, v := range vars {
		result = append(result, toGQLUserActivityVar(v))
	}
	return result
}

func toGQLUserActivityVar(a entity.UserActivityVar) *UserActivityVar {
	return &UserActivityVar{
		Key:   a.Key,
		Value: a.Value,
	}
}

func toGQlNodeLog(l *entity.NodeLog) *NodeLog {
	return &NodeLog{
		Date:      l.Date,
		Type:      l.Type,
		VersionID: l.VersionId,
		NodeID:    l.NodeId,
		PodID:     l.PodId,
		Message:   l.Message,
		Level:     l.Level,
	}
}

func toGQlVersionNodeStatus(v *entity.VersionNodeStatus) *VersionNodeStatus {
	var status NodeStatus

	switch v.Status {
	case entity.NodeStatusStarted:
		status = NodeStatusStarted
	case entity.NodeStatusStopped:
		status = NodeStatusStopped
	case entity.NodeStatusError:
		status = NodeStatusError
	}

	return &VersionNodeStatus{
		Date:    time.Now().Format(time.RFC3339),
		NodeID:  v.NodeID,
		Status:  status,
		Message: v.Message,
	}
}
