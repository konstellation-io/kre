package version

import (
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
	if status, ok := getNodeStatus(n.logger, p); ok {
		if status == entity.NodeStatusStarted {
			n.started[p.Labels["node-id"]] = true
		}

		n.logger.Debugf("[StatusResolver] waiting: %d/%d", len(n.started), len(n.nodes))

		if len(n.nodes) == len(n.started) {
			n.statusCh <- struct{}{}
		}
	}
}

func getNodeStatus(logger *simplelogger.SimpleLogger, p *coreV1.Pod) (entity.NodeStatus, bool) {
	total := 0
	running := 0
	terminated := 0
	waiting := 0
	crashLoopBackOff := 0
	containerCreating := 0

	for i := range p.Status.ContainerStatuses {
		cs := p.Status.ContainerStatuses[i]

		total++

		if cs.State.Running != nil {
			running++
		}

		if cs.State.Terminated != nil {
			terminated++
		}

		if cs.State.Waiting != nil {
			waiting++

			if cs.State.Waiting.Reason == "CrashLoopBackOff" {
				crashLoopBackOff++
			} else if cs.State.Waiting.Reason == "ContainerCreating" {
				containerCreating++
			}
		}
	}

	logger.Debugf("[StatusResolver.getNodeStatus] POD[%s] total[%d] running[%d] terminated[%d] waiting[%d]"+
		" crashLoopBackOff[%d] containerCreating[%d]",
		p.Name, total, running, terminated, waiting, crashLoopBackOff, containerCreating)

	if terminated == total {
		return entity.NodeStatusStopped, true
	}

	if terminated > 0 || crashLoopBackOff > 0 {
		return entity.NodeStatusError, true
	}

	if containerCreating == total {
		return entity.NodeStatusStarting, true
	}

	if running == total {
		return entity.NodeStatusStarted, true
	}

	return entity.NodeStatusError, false
}
