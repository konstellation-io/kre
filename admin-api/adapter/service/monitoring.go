package service

import (
	"context"
	"fmt"
	"io"

	"google.golang.org/grpc"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/service/proto/monitoringpb"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
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
					Type:      msg.GetType(),
					VersionId: msg.GetVersionId(),
					NodeId:    msg.GetNodeId(),
					PodId:     msg.GetPodId(),
					Message:   msg.GetMessage(),
					Level:     msg.GetLevel(),
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
