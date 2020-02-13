package service

import (
	"gitlab.com/konstellation/kre/runtime-api/config"
	"gitlab.com/konstellation/kre/runtime-api/entity"
	"gitlab.com/konstellation/kre/runtime-api/kubernetes"
	"gitlab.com/konstellation/kre/runtime-api/logging"
	"gitlab.com/konstellation/kre/runtime-api/mongo"
	"gitlab.com/konstellation/kre/runtime-api/proto/monitoringpb"
)

// MonitoringService basic server
type MonitoringService struct {
	config *config.Config
	logger *logging.Logger
	// TODO: Change to interfaces
	status *kubernetes.Watcher
	logs   *mongo.Watcher
}

// NewMonitoringService instantiates the GRPC server implementation
func NewMonitoringService(config *config.Config, logger *logging.Logger, status *kubernetes.Watcher, logs *mongo.Watcher) *MonitoringService {
	return &MonitoringService{
		config,
		logger,
		status,
		logs,
	}
}

func (w *MonitoringService) NodeStatus(req *monitoringpb.NodeStatusRequest, stream monitoringpb.MonitoringService_NodeStatusServer) error {
	versionName := req.GetVersionName()

	w.logger.Info("------------ STARTING WATCHER -------------")

	ctx := stream.Context()
	statusCh := make(chan *entity.VersionNodeStatus, 1)
	waitCh := w.status.NodeStatus(ctx, versionName, statusCh)

	for {
		select {
		case <-waitCh:
			w.logger.Info("------------- WATCHER STOPPED. RETURN FROM GRPC FUNCTION ---------")
			return nil

		case <-ctx.Done():
			w.logger.Info("------------- CONTEXT CLOSED ---------")
			close(waitCh)
			return nil

		case nodeStatus := <-statusCh:
			err := stream.Send(&monitoringpb.NodeStatusResponse{
				Status:  string(nodeStatus.Status),
				NodeId:  nodeStatus.NodeID,
				Message: nodeStatus.Message,
			})

			if err != nil {
				w.logger.Info("---------- ERROR SENDING TO CLIENT. RETURN FROM GRPC FUNCTION -------")
				close(waitCh)
				w.logger.Error(err.Error())
				return err
			}
		}
	}
}

// Node Logs
func (w *MonitoringService) NodeLogs(req *monitoringpb.NodeLogsRequest, stream monitoringpb.MonitoringService_NodeLogsServer) error {
	versionName := req.GetNodeId()

	w.logger.Info("------------ STARTING WATCHER -------------")

	ctx := stream.Context()
	logsCh := make(chan *entity.NodeLog, 1)
	w.logs.NodeLogs(ctx, versionName, logsCh)

	for {
		select {
		case log := <-logsCh:

			err := stream.Send(log)

			if err != nil {
				w.logger.Info("---------- ERROR SENDING TO CLIENT. RETURN FROM GRPC FUNCTION -------")
				w.logger.Error(err.Error())
				return err
			}
		}
	}
}
