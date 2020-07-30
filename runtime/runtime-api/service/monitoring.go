package service

import (
	"context"
	"fmt"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"github.com/konstellation-io/kre/runtime/runtime-api/config"
	"github.com/konstellation-io/kre/runtime/runtime-api/entity"
	"github.com/konstellation-io/kre/runtime/runtime-api/kubernetes"
	"github.com/konstellation-io/kre/runtime/runtime-api/mongo"
	"github.com/konstellation-io/kre/runtime/runtime-api/proto/monitoringpb"
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

func (w *MonitoringService) WatchNodeStatus(req *monitoringpb.NodeStatusRequest, stream monitoringpb.MonitoringService_WatchNodeStatusServer) error {
	w.logger.Info("[MonitoringService.WatchNodeStatus] starting watcher...")

	versionName := req.GetVersionName()
	nodeCh := make(chan entity.Node, 1)
	stopCh := w.status.WatchNodeStatus(versionName, nodeCh)
	defer close(stopCh) // The k8s informer opened in WatchNodeStatus will be stopped when stopCh is closed.

	for {
		select {
		case <-stream.Context().Done():
			w.logger.Info("[MonitoringService.WatchNodeStatus] context closed")
			return nil

		case node := <-nodeCh:
			w.logger.Debugf("[MonitoringService.WatchNodeStatus] new status[%s] for node[%s - %s]", node.Status, node.Name, node.ID)
			err := stream.Send(&monitoringpb.NodeStatusResponse{
				Status: string(node.Status),
				NodeId: node.ID,
				Name:   node.Name,
			})

			if err != nil {
				w.logger.Infof("[MonitoringService.WatchNodeStatus] error sending to client: %s", err)
				return err
			}
		}
	}
}

func (w *MonitoringService) NodeLogs(req *monitoringpb.NodeLogsRequest, stream monitoringpb.MonitoringService_NodeLogsServer) error {
	options := mongo.WatchLogsOptions{
		VersionID: req.GetVersionID(),
		Search:    req.GetSearch(),
		Levels:    req.GetLevels(),
		NodeIDs:   req.GetNodeIDs(),
	}

	w.logger.Info("[MonitoringService.NodeLogs] starting watcher...")

	ctx := stream.Context()
	logsCh := make(chan *entity.NodeLog, 1)
	defer close(logsCh)

	w.logs.WatchNodeLogs(ctx, options, logsCh)

	for {
		select {
		case <-ctx.Done():
			w.logger.Info("[MonitoringService.NodeLogs] context closed")
			return nil
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
