package service

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"gitlab.com/konstellation/kre/runtime-api/config"
	"gitlab.com/konstellation/kre/runtime-api/entity"
	"gitlab.com/konstellation/kre/runtime-api/kubernetes"
	"gitlab.com/konstellation/kre/runtime-api/mongo"
	"gitlab.com/konstellation/kre/runtime-api/proto/monitoringpb"
	"time"
)

// MonitoringService basic server
type MonitoringService struct {
	config *config.Config
	logger *simplelogger.SimpleLogger
	// TODO: Change to interfaces
	status  *kubernetes.Watcher
	logs    *mongo.LogRepo
	metrics *mongo.MetricsRepo
}

// NewMonitoringService instantiates the gRPC server implementation
func NewMonitoringService(config *config.Config, logger *simplelogger.SimpleLogger, status *kubernetes.Watcher, logs *mongo.LogRepo, metrics *mongo.MetricsRepo) *MonitoringService {
	return &MonitoringService{
		config,
		logger,
		status,
		logs,
		metrics,
	}
}

func (w *MonitoringService) NodeStatus(req *monitoringpb.NodeStatusRequest, stream monitoringpb.MonitoringService_NodeStatusServer) error {
	versionName := req.GetVersionName()

	w.logger.Info("[MonitoringService.NodeStatus] starting watcher...")

	ctx := stream.Context()
	statusCh := make(chan *entity.VersionNodeStatus, 1)
	waitCh := w.status.NodeStatus(ctx, versionName, statusCh)

	for {
		select {
		case <-waitCh:
			w.logger.Info("[MonitoringService.NodeStatus] watcher stopped")
			return nil

		case <-ctx.Done():
			w.logger.Info("[MonitoringService.NodeStatus] context closed")
			close(waitCh)
			return nil

		case nodeStatus := <-statusCh:
			err := stream.Send(&monitoringpb.NodeStatusResponse{
				Status:  string(nodeStatus.Status),
				NodeId:  nodeStatus.NodeID,
				Message: nodeStatus.Message,
			})

			if err != nil {
				w.logger.Infof("[MonitoringService.NodeStatus] error sending to client: %s", err)
				close(waitCh)
				return err
			}
		}
	}
}

func (w *MonitoringService) NodeLogs(req *monitoringpb.NodeLogsRequest, stream monitoringpb.MonitoringService_NodeLogsServer) error {
	options := mongo.WatchLogsOptions{
		Search:  req.GetSearch(),
		Levels:  req.GetLevels(),
		NodeIDs: req.GetNodeIDs(),
	}

	w.logger.Info("[MonitoringService.NodeLogs] starting watcher...")

	ctx := stream.Context()
	logsCh := make(chan *entity.NodeLog, 1)
	w.logs.WatchNodeLogs(ctx, options, logsCh)

	for {
		select {
		case l := <-logsCh:
			err := stream.Send(toNodeLogsResponse(l))

			if err != nil {
				w.logger.Info("[MonitoringService.NodeLogs] error sending to client: %s")
				w.logger.Error(err.Error())
				return err
			}
		}
	}
}

func (w *MonitoringService) SearchLogs(ctx context.Context, req *monitoringpb.SearchLogsRequest) (*monitoringpb.SearchLogsResponse, error) {
	var result *monitoringpb.SearchLogsResponse

	startDate, err := time.Parse(time.RFC3339, req.StartDate)
	if err != nil {
		return result, fmt.Errorf("invalid start date: %w", err)
	}

	var endDate time.Time
	if req.EndDate == "" {
		endDate = time.Now()
	} else {
		endDate, err = time.Parse(time.RFC3339, req.EndDate)
		if err != nil {
			return result, fmt.Errorf("invalid end date: %w", err)
		}
	}

	search, err := w.logs.PaginatedSearch(ctx, mongo.SearchLogsOptions{
		Cursor:    req.Cursor,
		StartDate: startDate,
		EndDate:   endDate,
		Search:    req.Search,
		NodeIDs:   req.NodeIDs,
		Levels:    req.Levels,
	})

	if err != nil {
		return result, err
	}

	var logs []*monitoringpb.NodeLogsResponse
	for _, l := range search.Logs {
		logs = append(logs, toNodeLogsResponse(l))
	}

	return &monitoringpb.SearchLogsResponse{
		Cursor: search.Cursor,
		Logs:   logs,
	}, nil
}

func (w *MonitoringService) GetMetrics(ctx context.Context, in *monitoringpb.GetMetricsRequest) (*monitoringpb.GetMetricsResponse, error) {
	result := &monitoringpb.GetMetricsResponse{}

	startDate, err := time.Parse(time.RFC3339, in.StartDate)
	if err != nil {
		return result, fmt.Errorf("invalid start date: %w", err)
	}

	endDate, err := time.Parse(time.RFC3339, in.EndDate)
	if err != nil {
		return result, fmt.Errorf("invalid end date: %w", err)
	}

	getMetricsResult, err := w.metrics.GetMetrics(ctx, startDate, endDate, in.VersionID)
	if err != nil {
		return result, fmt.Errorf("error getting metrics from db: %w", err)
	}

	var metrics []*monitoringpb.MetricRow
	for _, m := range getMetricsResult {
		metrics = append(metrics, &monitoringpb.MetricRow{
			Date:           m.Date,
			Error:          m.Error,
			PredictedValue: m.PredictedValue,
			TrueValue:      m.TrueValue,
		})
	}
	result.Metrics = metrics

	return result, nil
}

func toNodeLogsResponse(log *entity.NodeLog) *monitoringpb.NodeLogsResponse {
	return &monitoringpb.NodeLogsResponse{
		Id:           log.ID,
		Date:         log.Date,
		Level:        log.Level,
		Message:      log.Message,
		NodeId:       log.NodeID,
		NodeName:     log.NodeName,
		WorkflowId:   log.WorkflowID,
		WorkflowName: log.WorkflowName,
	}
}
