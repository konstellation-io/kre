package service

import (
	"context"
	"fmt"
	"io"
	"time"

	"google.golang.org/grpc"

	"gitlab.com/konstellation/kre/admin-api/adapter/service/proto/monitoringpb"

	"gitlab.com/konstellation/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
)

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

func (m *MonitoringService) NodeLogs(runtime *entity.Runtime, nodeId string, stopCh <-chan bool) (<-chan *entity.NodeLog, error) {
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", runtime.GetNamespace()), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	c := monitoringpb.NewMonitoringServiceClient(cc)

	req := monitoringpb.NodeLogsRequest{
		NodeId: nodeId,
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
				ch <- &entity.NodeLog{
					ID:        msg.GetId(),
					Date:      msg.Date,
					VersionId: msg.GetVersionId(),
					NodeId:    msg.GetNodeId(),
					PodId:     msg.GetPodId(),
					Message:   msg.GetMessage(),
					Level:     msg.GetLevel(),
					NodeName:  msg.GetNodeName(),
				}
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

func (m *MonitoringService) VersionStatus(runtime *entity.Runtime, versionName string, stopCh <-chan bool) (<-chan *entity.VersionNodeStatus, error) {
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

	ch := make(chan *entity.VersionNodeStatus, 1)
	var st *entity.NodeStatus

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

			if msg.GetNodeId() != "" {
				ch <- &entity.VersionNodeStatus{
					NodeID:  msg.GetNodeId(),
					Status:  st.GetStatus(msg.GetStatus()),
					Message: msg.GetMessage(),
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

func (m *MonitoringService) SearchLogs(ctx context.Context, runtime *entity.Runtime, options entity.SearchLogsOptions) (entity.SearchLogsResult, error) {
	var result entity.SearchLogsResult
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", runtime.GetNamespace()), grpc.WithInsecure())
	if err != nil {
		return result, err
	}

	c := monitoringpb.NewMonitoringServiceClient(cc)
	req := monitoringpb.SearchLogsRequest{
		Search:     options.Search,
		StartDate:  options.StartDate.Format(time.RFC3339),
		EndDate:    options.EndDate.Format(time.RFC3339),
		WorkflowID: options.WorkflowID,
		NodeID:     options.NodeID,
		Level:      options.Level,
		Cursor:     options.Cursor,
	}

	res, err := c.SearchLogs(ctx, &req)
	if err != nil {
		return result, err
	}

	var logs []*entity.NodeLog
	if len(res.Logs) > 0 {
		for _, l := range res.Logs {
			logs = append(logs, &entity.NodeLog{
				ID:        l.Id,
				Date:      l.Date,
				Level:     l.Level,
				Message:   l.Message,
				VersionId: l.VersionId,
				NodeId:    l.NodeId,
				PodId:     l.PodId,
				NodeName:  l.NodeName,
			})
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
