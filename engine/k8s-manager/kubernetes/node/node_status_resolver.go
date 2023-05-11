package node

import (
	"github.com/konstellation-io/kre/engine/k8s-manager/entity"
	"github.com/konstellation-io/kre/libs/simplelogger"

	coreV1 "k8s.io/api/core/v1"
)

type NodeStatusResolver struct { //nolint:golint
	Out        chan<- entity.Node
	Logger     *simplelogger.SimpleLogger
	LastStatus map[string]entity.NodeStatus
}

func (n *NodeStatusResolver) OnAdd(obj interface{}) {
	n.onAddOrUpdate(obj)
}

func (n *NodeStatusResolver) OnUpdate(_, obj interface{}) {
	n.onAddOrUpdate(obj)
}

func (n *NodeStatusResolver) OnDelete(obj interface{}) {
	p := obj.(*coreV1.Pod)
	n.sendNodeStatus(n.newNode(p.Labels, entity.NodeStatusStopped))
}

func (n *NodeStatusResolver) onAddOrUpdate(obj interface{}) {
	p := obj.(*coreV1.Pod)
	if s, ok := GetNodeStatus(n.Logger, p); ok {
		n.sendNodeStatus(n.newNode(p.Labels, s))
	}
}

func (n *NodeStatusResolver) sendNodeStatus(node entity.Node) {
	lastStatus, found := n.LastStatus[node.ID]
	if !found || node.Status != lastStatus {
		n.Out <- node
		n.LastStatus[node.ID] = node.Status
	}
}

func (n *NodeStatusResolver) newNode(labels map[string]string, status entity.NodeStatus) entity.Node {
	return entity.Node{
		ID:     labels["node-id"],
		Name:   labels["node-name"],
		Status: status,
	}
}
