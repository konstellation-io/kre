package kubernetes

import (
	"github.com/konstellation-io/kre/engine/k8s-manager/entity"
	"github.com/konstellation-io/kre/libs/simplelogger"

	coreV1 "k8s.io/api/core/v1"
)

type NodeStatusResolver struct {
	out        chan<- entity.Node
	logger     *simplelogger.SimpleLogger
	lastStatus map[string]entity.NodeStatus
}

func (n *NodeStatusResolver) onAdd(obj interface{}) {
	n.onAddOrUpdate(obj)
}

func (n *NodeStatusResolver) onUpdate(_, obj interface{}) {
	n.onAddOrUpdate(obj)
}

func (n *NodeStatusResolver) onDelete(obj interface{}) {
	p := obj.(*coreV1.Pod)
	n.sendNodeStatus(n.newNode(p.Labels, entity.NodeStatusStopped))
}

func (n *NodeStatusResolver) onAddOrUpdate(obj interface{}) {
	p := obj.(*coreV1.Pod)
	if s, ok := getNodeStatus(n.logger, p); ok {
		n.sendNodeStatus(n.newNode(p.Labels, s))
	}
}

func (n *NodeStatusResolver) sendNodeStatus(node entity.Node) {
	lastStatus, found := n.lastStatus[node.ID]
	if !found || node.Status != lastStatus {
		n.out <- node
		n.lastStatus[node.ID] = node.Status
	}
}

func (n *NodeStatusResolver) newNode(labels map[string]string, status entity.NodeStatus) entity.Node {
	return entity.Node{
		ID:     labels["node-id"],
		Name:   labels["node-name"],
		Status: status,
	}
}

func getNodeStatus(logger *simplelogger.SimpleLogger, p *coreV1.Pod) (entity.NodeStatus, bool) {
	total := 0
	running := 0
	terminated := 0
	waiting := 0
	crashLoopBackOff := 0
	containerCreating := 0

	for _, cs := range p.Status.ContainerStatuses {
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

	logger.Debugf("[NodeStatusResolver.getNodeStatus] POD[%s] total[%d] running[%d] terminated[%d] waiting[%d] crashLoopBackOff[%d] containerCreating[%d]",
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
