package version

import (
	"github.com/konstellation-io/kre/engine/k8s-manager/kubernetes/node"
	"github.com/konstellation-io/kre/libs/simplelogger"

	coreV1 "k8s.io/api/core/v1"

	"github.com/konstellation-io/kre/engine/k8s-manager/entity"
)

type StatusResolver struct {
	logger   *simplelogger.SimpleLogger
	statusCh chan struct{}
	nodes    []string
	started  map[string]bool
}

func NewStatusResolver(logger *simplelogger.SimpleLogger, nodes []string, statusCh chan struct{}) StatusResolver {
	return StatusResolver{
		logger,
		statusCh,
		nodes,
		map[string]bool{},
	}
}

func (n *StatusResolver) onAdd(obj interface{}) {
	n.onAddOrUpdate(obj)
}

func (n *StatusResolver) onUpdate(_, obj interface{}) {
	n.onAddOrUpdate(obj)
}

func (n *StatusResolver) onDelete(obj interface{}) {
	n.onAddOrUpdate(obj)
}

func (n *StatusResolver) onAddOrUpdate(obj interface{}) {
	p := obj.(*coreV1.Pod)
	if status, ok := node.GetNodeStatus(n.logger, p); ok {
		if status == entity.NodeStatusStarted {
			n.started[p.Labels["node-id"]] = true
		}

		n.logger.Debugf("[StatusResolver] waiting: %d/%d", len(n.started), len(n.nodes))

		if len(n.nodes) == len(n.started) {
			n.statusCh <- struct{}{}
		}
	}
}
