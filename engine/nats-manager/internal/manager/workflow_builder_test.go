package manager_test

import (
	"github.com/konstellation-io/kre/engine/nats-manager/internal/entity"
)

type WorkflowBuilder struct {
	workflow *entity.Workflow
}

func NewWorkflowBuilder() *WorkflowBuilder {
	return &WorkflowBuilder{
		&entity.Workflow{
			Name:       "test-workflow",
			Entrypoint: "defaultEntrypoint",
			Nodes: []*entity.Node{
				{
					Name: "defaultNode",
				},
			},
		},
	}
}

func (w *WorkflowBuilder) Build() *entity.Workflow {
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

func (w *WorkflowBuilder) WithNodeObjectStore(objectStore *entity.ObjectStore) *WorkflowBuilder {
	w.workflow.Nodes[0].ObjectStore = objectStore
	return w
}

func (w *WorkflowBuilder) WithNodes(nodes []*entity.Node) *WorkflowBuilder {
	w.workflow.Nodes = nodes
	return w
}
