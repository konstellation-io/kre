package node

import (
	"github.com/konstellation-io/kre/engine/k8s-manager/entity"
	"github.com/konstellation-io/kre/libs/simplelogger"
	coreV1 "k8s.io/api/core/v1"
)

func GetNodeStatus(logger *simplelogger.SimpleLogger, p *coreV1.Pod) (entity.NodeStatus, bool) {
	total := 0
	running := 0
	terminated := 0
	crashLoopBackOff := 0
	waiting := 0

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
			if cs.State.Waiting.Reason == "CrashLoopBackOff" {
				crashLoopBackOff++
			} else if cs.State.Waiting.Reason == "ContainerCreating" || cs.State.Waiting.Reason == "PodInitializing" {
				waiting++
			}
		}
	}

	logger.Debugf("[StatusResolver.getNodeStatus] POD[%s] total[%d] running[%d] terminated[%d]"+
		" crashLoopBackOff[%d] waiting[%d]",
		p.Name, total, running, terminated, crashLoopBackOff, waiting)

	if terminated == total {
		return entity.NodeStatusStopped, true
	}

	if terminated > 0 || crashLoopBackOff > 0 {
		return entity.NodeStatusError, true
	}

	if waiting == total {
		return entity.NodeStatusStarting, true
	}

	if running == total {
		return entity.NodeStatusStarted, true
	}

	return entity.NodeStatusError, false
}
