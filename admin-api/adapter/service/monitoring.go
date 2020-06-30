package service

import (
	"context"
	"fmt"
	"io"

	"google.golang.org/grpc"

	"github.com/konstellation-io/kre/admin-api/adapter/service/proto/monitoringpb"

	"github.com/konstellation-io/kre/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
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

func (m *MonitoringService) NodeLogs(runtime *entity.Runtime, versionID string, filters entity.LogFilters, stopCh <-chan bool) (<-chan *entity.NodeLog, error) {
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", runtime.GetNamespace()), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	c := monitoringpb.NewMonitoringServiceClient(cc)

	req := monitoringpb.NodeLogsRequest{
		Search:    emptyStringIfNil(filters.Search),
		VersionID: versionID,
		NodeIDs:   filters.NodeIds,
		Levels:    levelsToStrings(filters.Levels),
	}

	ctx := context.Background()

	m.logger.Info("[monitoring.NodeLogs] opening stream with runtime-api...")

	stream, err := c.NodeLogs(ctx, &req)
	if err != nil {
		return nil, err
	}

	ch := make(chan *entity.NodeLog, 1)

	go func() {
		for {
			m.logger.Info("[monitoring.NodeLogs] waiting for stream.Recv()...")
			msg, err := stream.Recv()

			if err == io.EOF {
				m.logger.Info("[monitoring.NodeLogs] EOF msg received. Stopping...")
				close(ch)
				return
			}

			if err != nil {
				m.logger.Error(err.Error())
				close(ch)
				return
			}

			m.logger.Info("[monitoring.NodeLogs] Message received")

			if msg.GetNodeId() != "" {
				ch <- toNodeLogEntity(msg)
			}
		}
	}()

	go func() {
		<-stopCh
		err := cc.Close()
		if err != nil {
			m.logger.Error(err.Error())
		}
		m.logger.Info("[monitoring.NodeLogs] Stop received. Connection via gRPC closed")
	}()

	return ch, nil
}

func (m *MonitoringService) VersionStatus(runtime *entity.Runtime, versionName string, stopCh <-chan bool) (<-chan *entity.Node, error) {
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", runtime.GetNamespace()), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	c := monitoringpb.NewMonitoringServiceClient(cc)

	req := monitoringpb.NodeStatusRequest{
		VersionName: versionName,
	}

	ctx := context.Background()

	m.logger.Info("[monitoring.VersionStatus] opening stream with runtime-api...")

	stream, err := c.NodeStatus(ctx, &req)
	if err != nil {
		return nil, err
	}

	ch := make(chan *entity.Node, 1)

	go func() {
		for {
			m.logger.Info("[monitoring.VersionStatus] waiting for stream.Recv()...")
			msg, err := stream.Recv()

			if err == io.EOF {
				m.logger.Info("[monitoring.VersionStatus] EOF msg received. Stopping...")
				close(ch)
				return
			}

			if err != nil {
				m.logger.Error(err.Error())
				close(ch)
				return
			}

			m.logger.Info("[monitoring.VersionStatus] Message received")

			status := entity.NodeStatus(msg.GetStatus())
			if !status.IsValid() {
				m.logger.Errorf("Invalid node status: %s", status)
				close(ch)
				return
			}

			if msg.GetNodeId() != "" {
				ch <- &entity.Node{
					ID:     msg.GetNodeId(),
					Name:   msg.GetName(),
					Status: status,
				}
			}
		}
	}()

	go func() {
		<-stopCh
		m.logger.Info("[monitoring.VersionStatus] Stop received. Connection via gRPC closed")
		err := cc.Close()
		if err != nil {
			m.logger.Error(err.Error())
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
