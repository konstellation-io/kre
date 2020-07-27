package service

import (
	"context"
	"fmt"
	"io"

	"google.golang.org/grpc"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/service/proto/monitoringpb"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
)

func emptyStringIfNil(val *string) string {
	if val != nil {
		return *val
	}
	return ""
}

func levelsToStrings(levels []entity.LogLevel) []string {
	result := make([]string, len(levels))
	for i, l := range levels {
		result[i] = l.String()
	}
	return result
}

func toNodeLogEntity(log *monitoringpb.NodeLogsResponse) *entity.NodeLog {
	return &entity.NodeLog{
		ID:           log.GetId(),
		Date:         log.GetDate(),
		Level:        entity.LogLevel(log.GetLevel()),
		Message:      log.GetMessage(),
		NodeID:       log.GetNodeId(),
		NodeName:     log.GetNodeName(),
		WorkflowID:   log.GetWorkflowId(),
		WorkflowName: log.GetWorkflowName(),
	}
}

type MonitoringService struct {
	cfg    *config.Config
	logger logging.Logger
}

func NewMonitoringService(cfg *config.Config, logger logging.Logger) *MonitoringService {
	return &MonitoringService{
		cfg,
		logger,
	}
}

func (m *MonitoringService) NodeLogs(ctx context.Context, runtime *entity.Runtime, versionID string, filters entity.LogFilters) (<-chan *entity.NodeLog, error) {
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", runtime.GetNamespace()), grpc.WithInsecure())
	if err != nil {
		return nil, fmt.Errorf("node logs connecting: %w", err)
	}

	m.logger.Info("[MonitoringService.NodeLogs] opening stream with runtime-api...")
	c := monitoringpb.NewMonitoringServiceClient(cc)
	stream, err := c.NodeLogs(ctx, &monitoringpb.NodeLogsRequest{
		Search:    emptyStringIfNil(filters.Search),
		VersionID: versionID,
		NodeIDs:   filters.NodeIds,
		Levels:    levelsToStrings(filters.Levels),
	})
	if err != nil {
		return nil, err
	}

	ch := make(chan *entity.NodeLog, 1)

	go func() {
		defer close(ch)
		defer func() {
			err := cc.Close()
			if err != nil {
				m.logger.Errorf("[MonitoringService.NodeLogs] closing gRPC: %s", err)
			}
		}()

		for {
			m.logger.Debug("[MonitoringService.NodeLogs] waiting for stream.Recv()...")
			msg, err := stream.Recv()

			if stream.Context().Err() == context.Canceled {
				m.logger.Debug("[MonitoringService.NodeLogs] Context canceled")
				return
			}

			if err == io.EOF {
				m.logger.Debug("[MonitoringService.NodeLogs] EOF msg received")
				return
			}

			if err != nil {
				m.logger.Errorf("[MonitoringService.NodeLogs] Unexpected error: %s", err)
				return
			}

			m.logger.Debug("[MonitoringService.NodeLogs] Message received")
			ch <- toNodeLogEntity(msg)
		}
	}()

	return ch, nil
}

func (m *MonitoringService) WatchNodeStatus(ctx context.Context, runtime *entity.Runtime, versionName string) (<-chan *entity.Node, error) {
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", runtime.GetNamespace()), grpc.WithInsecure())
	if err != nil {
		return nil, fmt.Errorf("version status connecting: %w", err)
	}

	m.logger.Debug("[MonitoringService.WatchNodeStatus] opening stream with runtime-api...")
	c := monitoringpb.NewMonitoringServiceClient(cc)
	stream, err := c.WatchNodeStatus(ctx, &monitoringpb.NodeStatusRequest{
		VersionName: versionName,
	})
	if err != nil {
		return nil, fmt.Errorf("version status opening stream: %w", err)
	}

	ch := make(chan *entity.Node, 1)

	go func() {
		defer close(ch)
		defer func() {
			err := cc.Close()
			if err != nil {
				m.logger.Errorf("[MonitoringService.WatchNodeStatus] closing gRPC: %s", err)
			}
		}()

		for {
			m.logger.Debug("[MonitoringService.WatchNodeStatus] waiting for stream.Recv()...")
			msg, err := stream.Recv()

			if stream.Context().Err() == context.Canceled {
				m.logger.Debug("[MonitoringService.WatchNodeStatus] Context canceled.")
				return
			}

			if err == io.EOF {
				m.logger.Debug("[MonitoringService.WatchNodeStatus] EOF msg received.")
				return
			}

			if err != nil {
				m.logger.Errorf("[MonitoringService.WatchNodeStatus] Unexpected error: %s", err)
				return
			}

			m.logger.Debug("[MonitoringService.WatchNodeStatus] Message received")

			status := entity.NodeStatus(msg.GetStatus())
			if !status.IsValid() {
				m.logger.Errorf("[MonitoringService.WatchNodeStatus] Invalid node status: %s", status)
				continue
			}

			ch <- &entity.Node{
				ID:     msg.GetNodeId(),
				Name:   msg.GetName(),
				Status: status,
			}
		}
	}()

	return ch, nil
}

func (m *MonitoringService) SearchLogs(
	ctx context.Context,
	runtime *entity.Runtime,
	versionID string,
	filters entity.LogFilters,
	cursor *string,
) (entity.SearchLogsResult, error) {
	var result entity.SearchLogsResult
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", runtime.GetNamespace()), grpc.WithInsecure())
	if err != nil {
		return result, err
	}

	c := monitoringpb.NewMonitoringServiceClient(cc)
	req := monitoringpb.SearchLogsRequest{
		Search:    emptyStringIfNil(filters.Search),
		StartDate: filters.StartDate,
		EndDate:   emptyStringIfNil(filters.EndDate),
		VersionID: versionID,
		NodeIDs:   filters.NodeIds,
		Levels:    levelsToStrings(filters.Levels),
		Cursor:    emptyStringIfNil(cursor),
	}

	res, err := c.SearchLogs(ctx, &req)
	if err != nil {
		return result, err
	}

	var logs []*entity.NodeLog
	if len(res.Logs) > 0 {
		for _, l := range res.Logs {
			logs = append(logs, toNodeLogEntity(l))
		}
	}

	result.Logs = logs
	result.Cursor = res.Cursor

	return result, nil
}

func (m *MonitoringService) GetMetrics(ctx context.Context, runtime *entity.Runtime, versionID string, startDate string, endDate string) ([]entity.MetricRow, error) {
	var result []entity.MetricRow
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", runtime.GetNamespace()), grpc.WithInsecure())
	if err != nil {
		return result, err
	}

	c := monitoringpb.NewMonitoringServiceClient(cc)
	req := monitoringpb.GetMetricsRequest{
		VersionID: versionID,
		StartDate: startDate,
		EndDate:   endDate,
	}

	res, err := c.GetMetrics(ctx, &req)
	if err != nil {
		return result, err
	}

	m.logger.Infof("Received %d metrics", len(res.Metrics))
	for _, m := range res.Metrics {
		result = append(result, entity.MetricRow{
			Date:           m.Date,
			Error:          m.Error,
			PredictedValue: m.PredictedValue,
			TrueValue:      m.TrueValue,
		})
	}
	return result, nil
}
