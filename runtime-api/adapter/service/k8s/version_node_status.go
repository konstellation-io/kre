package k8s

import (
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
	v1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
)

func (k *ResourceManagerService) WatchVersionNodeStatus(versionName string, statusCh chan<- *entity.VersionNodeStatus) chan struct{} {
	ns := k.cfg.Kubernetes.Namespace

	label := strcase.ToKebab(versionName)
	k.logger.Info(fmt.Sprintf("--------------- WATCHING %s -----------", label))

	factory := informers.NewSharedInformerFactoryWithOptions(k.clientset, 0,
		informers.WithNamespace(ns),
		informers.WithTweakListOptions(func(options *metav1.ListOptions) {
			options.LabelSelector = fmt.Sprintf("version-name=%s,type=node", label)
		}))

	informer := factory.Apps().V1().Deployments().Informer()

	resolver := NodeStatusResolver{
		out:    statusCh,
		logger: k.logger,
	}
	stopCh := make(chan struct{})

	go func() {
		handlers := cache.ResourceEventHandlerFuncs{
			AddFunc:    resolver.OnAdd,
			UpdateFunc: resolver.OnUpdate,
			DeleteFunc: resolver.OnDelete,
		}

		k.logger.Info("------------ STARTING INFORMER -------------")

		informer.AddEventHandler(handlers)
		informer.Run(stopCh)
	}()

	return stopCh
}

type NodeStatusResolver struct {
	out    chan<- *entity.VersionNodeStatus
	logger logging.Logger
}

func (n *NodeStatusResolver) OnAdd(obj interface{}) {
	d, ok := obj.(*v1.Deployment)
	if !ok {
		return
	}

	ready := d.Status.ReadyReplicas
	total := d.Status.Replicas

	if ready == total && total > 0 {
		n.logger.Info("----- STATUS: STARTED ------")
		n.out <- &entity.VersionNodeStatus{
			NodeID:  d.Labels["node-id"],
			Status:  entity.NodeStatusStarted,
			Message: "",
		}
	}

	n.logger.Info(fmt.Sprintf("\n[ADD] DEPLOYMENT: %63s  ready/total: %d/%d\n", d.Name, ready, total))
}

func (n *NodeStatusResolver) OnUpdate(_, obj interface{}) {
	d, ok := obj.(*v1.Deployment)
	if !ok {
		return
	}

	ready := d.Status.ReadyReplicas
	total := d.Status.Replicas

	if d.Status.UnavailableReplicas != 0 {
		n.logger.Info("----- STATUS: ERROR ------")
		n.out <- &entity.VersionNodeStatus{
			NodeID:  d.Labels["node-id"],
			Status:  entity.NodeStatusError,
			Message: "",
		}
	} else if ready == total && total > 0 {
		n.logger.Info("----- STATUS: STARTED ------")
		n.out <- &entity.VersionNodeStatus{
			NodeID:  d.Labels["node-id"],
			Status:  entity.NodeStatusStarted,
			Message: "",
		}
	}
	n.logger.Info(fmt.Sprintf("\n[UPD] DEPLOYMENT: %63s  ready/total: %d/%d\n", d.Name, ready, total))
}

func (n *NodeStatusResolver) OnDelete(obj interface{}) {
	d, ok := obj.(*v1.Deployment)
	if !ok {
		return
	}

	ready := d.Status.ReadyReplicas
	total := d.Status.Replicas
	if total == 0 && ready == 0 {
		n.logger.Info("----- STATUS: STOPPED ------")
		n.out <- &entity.VersionNodeStatus{
			NodeID:  d.Labels["node-id"],
			Status:  entity.NodeStatusStopped,
			Message: "",
		}
	}
	n.logger.Info(fmt.Sprintf("\n[DEL] DEPLOYMENT: %63s  ready/total: %d/%d\n", d.Name, ready, total))
}
