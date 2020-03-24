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

	m.logger.Info("------------ CALLING RUNTIME API -------------")

	stream, err := c.NodeLogs(ctx, &req)
	if err != nil {
		return nil, err
	}

	ch := make(chan *entity.NodeLog, 1)

	go func() {
		for {
			m.logger.Info("------ WAITING FOR stream.Recv() -----")
			msg, err := stream.Recv()

			if err == io.EOF {
				m.logger.Info("------ EOF MSG RECEIVED. STOPPING  -----")
				close(ch)
				return
			}

			if err != nil {
				m.logger.Error(err.Error())
				close(ch)
				return
			}

			m.logger.Infof("------ Message received: %#v -----", msg.String())

			if msg.GetNodeId() != "" {
				ch <- &entity.NodeLog{
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
		m.logger.Info("------ STOP RECEIVED. CLOSING GRPC CONNECTION -----")
		err := cc.Close()
		if err != nil {
			m.logger.Error(err.Error())
		}
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

	m.logger.Info("------------ CALLING RUNTIME API -------------")

	stream, err := c.NodeStatus(ctx, &req)
	if err != nil {
		return nil, err
	}

	ch := make(chan *entity.VersionNodeStatus, 1)
	var st *entity.NodeStatus

	go func() {
		for {
			m.logger.Info("------ WAITING FOR stream.Recv() -----")
			msg, err := stream.Recv()

			if err == io.EOF {
				m.logger.Info("------ EOF MSG RECEIVED. STOPPING  -----")
				close(ch)
				return
			}

			if err != nil {
				m.logger.Error(err.Error())
				close(ch)
				return
			}

			m.logger.Infof("------ Message received: %#v -----", msg.String())

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
		m.logger.Info("------ STOP RECEIVED. CLOSING GRPC CONNECTION -----")
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
