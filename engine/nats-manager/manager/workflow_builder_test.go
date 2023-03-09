package manager_test

import "github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"

type WorkflowBuilder struct {
	workflow *natspb.Workflow
}

func NewWorkflowBuilder() *WorkflowBuilder {
	return &WorkflowBuilder{
		&natspb.Workflow{
			Name:       "defaultWorkflow",
			Entrypoint: "defaultEntrypoint",
			Nodes: []*natspb.Node{
				{
					Name: "defaultNode",
				},
			},
		},
	}
}

func (w *WorkflowBuilder) Build() *natspb.Workflow {
	return w.workflow
}

func (w *WorkflowBuilder) WithName(name string) *WorkflowBuilder {
	w.workflow.Name = name
	return w
}

func (w *WorkflowBuilder) WithEntrypoint(entrypoint string) *WorkflowBuilder {
	w.workflow.Entrypoint = entrypoint
	return w
}

func (w *WorkflowBuilder) WithNodeName(name string) *WorkflowBuilder {
	w.workflow.Nodes[0].Name = name
	return w
}

func (w *WorkflowBuilder) WithNodeSubscriptions(subscriptions []string) *WorkflowBuilder {
	w.workflow.Nodes[0].Subscriptions = subscriptions
	return w
}

func (w *WorkflowBuilder) WithNodeObjectStore(objectStore *natspb.Node_ObjectStore) *WorkflowBuilder {
	w.workflow.Nodes[0].ObjectStore = objectStore
	return w
}

func (w *WorkflowBuilder) WithNodes(nodes []*natspb.Node) *WorkflowBuilder {
	w.workflow.Nodes = nodes
	return w
}
