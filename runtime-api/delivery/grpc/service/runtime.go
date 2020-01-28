package service

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/runtimepb"
	"time"
)

// RuntimeService basic server
type RuntimeService struct {
	cfg        *config.Config
	logger     logging.Logger
	interactor *usecase.VersionInteractor
}

func NewRuntimeService(
	cfg *config.Config,
	logger logging.Logger,
	interactor *usecase.VersionInteractor,

) *RuntimeService {
	return &RuntimeService{
		cfg:        cfg,
		logger:     logger,
		interactor: interactor,
	}
}

func (s *RuntimeService) StartVersion(ctx context.Context, req *runtimepb.StartVersionRequest) (*runtimepb.StartVersionResponse, error) {
	s.logger.Info("StartVersionRequest received")
	mWorkflows := req.GetVersion().GetWorkflows()

	workflows := make([]entity.Workflow, len(mWorkflows))

	for i, w := range mWorkflows {
		nodes := make([]*entity.Node, len(w.GetNodes()))
		for j, n := range w.GetNodes() {
			nodes[j] = &entity.Node{
				ID:    n.GetId(),
				Name:  n.GetName(),
				Image: n.GetImage(),
				Src:   n.GetSrc(),
			}
		}

		edges := make([]*entity.Edge, len(w.GetEdges()))
		for k, e := range w.GetEdges() {
			edges[k] = &entity.Edge{
				ID:       e.GetId(),
				FromNode: e.GetFromNode(),
				ToNode:   e.GetToNode(),
			}
		}

		workflows[i].Name = w.GetName()
		workflows[i].Entrypoint = w.GetEntrypoint()
		workflows[i].Nodes = nodes
		workflows[i].Edges = edges
	}

	entrypoint := req.GetVersion().GetEntrypoint()
	configVars := make([]*entity.Config, len(req.GetVersion().GetConfig()))
	for i, c := range req.GetVersion().GetConfig() {
		configVars[i] = &entity.Config{
			Key:   c.GetKey(),
			Value: c.GetValue(),
		}
	}

	version := &entity.Version{
		Name: req.GetVersion().GetName(),
		Entrypoint: entity.Entrypoint{
			ProtoFile: entrypoint.GetProtoFile(),
			Image:     entrypoint.GetImage(),
			Src:       entrypoint.GetSrc(),
		},
		Config:    configVars,
		Workflows: workflows,
	}

	message := fmt.Sprintf("Version %s started", req.GetVersion().GetName())
	success := true

	_, err := s.interactor.StartVersion(version)
	if err != nil {
		success = false
		message = err.Error()
		s.logger.Error(message)
	}

	// Send response
	res := &runtimepb.StartVersionResponse{
		Success: success,
		Message: message,
	}

	return res, nil
}

func (s *RuntimeService) UpdateVersionConfig(ctx context.Context, req *runtimepb.UpdateVersionConfigRequest) (*runtimepb.UpdateVersionConfigResponse, error) {
	s.logger.Info("UpdateVersionConfig received")

	configVars := make([]*entity.Config, len(req.GetVersion().GetConfig()))
	for i, c := range req.GetVersion().GetConfig() {
		configVars[i] = &entity.Config{
			Key:   c.GetKey(),
			Value: c.GetValue(),
		}
	}

	version := &entity.Version{
		Name:   req.GetVersion().GetName(),
		Config: configVars,
	}

	message := fmt.Sprintf("Version %s config updated", req.GetVersion().GetName())
	success := true

	err := s.interactor.UpdateVersionConfig(version)
	if err != nil {
		success = false
		message = err.Error()
		s.logger.Error(message)
	}

	// Send response
	res := &runtimepb.UpdateVersionConfigResponse{
		Success: success,
		Message: message,
	}

	return res, nil
}

func (s *RuntimeService) StopVersion(ctx context.Context, req *runtimepb.StopVersionRequest) (*runtimepb.StopVersionResponse, error) {
	s.logger.Info("StopVersionRequest received")
	versionName := req.GetVersion().GetName()

	message := fmt.Sprintf("Version '%s' stopped", versionName)
	success := true

	_, err := s.interactor.StopVersion(versionName)
	if err != nil {
		success = false
		message = err.Error()
		s.logger.Error(message)
	}

	// Send response
	res := &runtimepb.StopVersionResponse{
		Success: success,
		Message: message,
	}

	return res, nil
}

func (s *RuntimeService) UnpublishVersion(ctx context.Context, req *runtimepb.UnpublishVersionRequest) (*runtimepb.UnpublishVersionResponse, error) {
	s.logger.Info("UnpublishVersionRequest received")
	versionName := req.GetVersion().GetName()

	message := fmt.Sprintf("Version '%s' deactivated", versionName)
	success := true

	_, err := s.interactor.UnpublishVersion(versionName)
	if err != nil {
		success = false
		message = err.Error()
		s.logger.Error(message)
	}

	// Send response
	res := &runtimepb.UnpublishVersionResponse{
		Success: success,
		Message: message,
	}

	return res, nil
}

func (s *RuntimeService) PublishVersion(ctx context.Context, req *runtimepb.PublishVersionRequest) (*runtimepb.PublishVersionResponse, error) {
	versionName := req.GetVersion().GetName()
	namespace := s.cfg.Kubernetes.Namespace
	s.logger.Info(fmt.Sprintf("Activating version \"%s\" in namespace \"%s\"...\n", versionName, namespace))

	_, err := s.interactor.PublishVersion(versionName)
	if err != nil {
		s.logger.Error(err.Error())
		return &runtimepb.PublishVersionResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &runtimepb.PublishVersionResponse{
		Success: true,
		Message: "Version activated correctly.",
	}, nil
}

func (s *RuntimeService) WatchNodeLogs(req *runtimepb.WatchNodeLogsRequest, stream runtimepb.RuntimeService_WatchNodeLogsServer) error {
	nodeId := req.GetNodeId()

	s.logger.Info("------------ STARTING WATCHER -------------")

	ctx, cancel := context.WithCancel(stream.Context())
	defer cancel()

	statusCh := s.interactor.WatchNodeLogs(ctx, nodeId)

	for {
		select {
		case <-ctx.Done():
			s.logger.Info("------------- STREAM CONTEXT STOPPED ---------")
			return nil
		case nodeLog := <-statusCh:
			err := stream.Send(&runtimepb.WatchNodeLogsResponse{
				Date:      nodeLog.Date,
				Type:      nodeLog.Type,
				VersionId: nodeLog.VersionId,
				NodeId:    nodeLog.NodeId,
				PodId:     nodeLog.PodId,
				Message:   nodeLog.Message,
				Level:     nodeLog.Level,
			})

			if err != nil {
				s.logger.Info("---------- ERROR SENDING TO CLIENT. RETURN FROM GRPC FUNCTION -------")
				s.logger.Error(err.Error())
				return err
			}
		}
	}
}

func (s *RuntimeService) WatchVersionStatus(req *runtimepb.WatchVersionRequest, stream runtimepb.RuntimeService_WatchVersionStatusServer) error {
	versionName := req.GetVersion().GetName()

	s.logger.Info("------------ STARTING WATCHER -------------")

	statusCh, waitCh := s.interactor.WatchVersionStatus(versionName)

	keepAliveCh := time.Tick(5 * time.Second)

	for {
		select {
		case <-waitCh:
			s.logger.Info("------------- WATCHER STOPPED. RETURN FROM GRPC FUNCTION ---------")
			return nil

		case <-keepAliveCh:
			s.logger.Info("------------- SENDING KEEP ALIVE ---------")

			err := stream.Send(&runtimepb.VersionNodeStatusResponse{})
			if err != nil {
				s.logger.Info("---------- KEEP ALIVE FAIL SENDING TO CLIENT. RETURN FROM GRPC FUNCTION -------")
				close(waitCh)
				s.logger.Error(err.Error())
				return err
			}

		case nodeStatus := <-statusCh:
			err := stream.Send(&runtimepb.VersionNodeStatusResponse{
				Status:  string(nodeStatus.Status),
				NodeId:  nodeStatus.NodeID,
				Message: nodeStatus.Message,
			})

			if err != nil {
				s.logger.Info("---------- ERROR SENDING TO CLIENT. RETURN FROM GRPC FUNCTION -------")
				close(waitCh)
				s.logger.Error(err.Error())
				return err
			}
		}
	}
}
