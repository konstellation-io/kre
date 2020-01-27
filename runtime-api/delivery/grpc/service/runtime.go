package service

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/runtimepb"
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

func (s *RuntimeService) DeployVersion(ctx context.Context, req *runtimepb.DeployVersionRequest) (*runtimepb.DeployVersionResponse, error) {
	s.logger.Info("DeployVersionRequest received")
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

	message := fmt.Sprintf("Version %s deployed", req.GetVersion().GetName())
	success := true

	_, err := s.interactor.DeployVersion(version)
	if err != nil {
		success = false
		message = err.Error()
		s.logger.Error(message)
	}

	// Send response
	res := &runtimepb.DeployVersionResponse{
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

func (s *RuntimeService) DeactivateVersion(ctx context.Context, req *runtimepb.DeactivateVersionRequest) (*runtimepb.DeactivateVersionResponse, error) {
	s.logger.Info("DeactivateVersionRequest received")
	versionName := req.GetVersion().GetName()

	message := fmt.Sprintf("Version '%s' deactivated", versionName)
	success := true

	_, err := s.interactor.DeactivateVersion(versionName)
	if err != nil {
		success = false
		message = err.Error()
		s.logger.Error(message)
	}

	// Send response
	res := &runtimepb.DeactivateVersionResponse{
		Success: success,
		Message: message,
	}

	return res, nil
}

func (s *RuntimeService) ActivateVersion(ctx context.Context, req *runtimepb.ActivateVersionRequest) (*runtimepb.ActivateVersionResponse, error) {
	versionName := req.GetVersion().GetName()
	namespace := s.cfg.Kubernetes.Namespace
	s.logger.Info(fmt.Sprintf("Activating version \"%s\" in namespace \"%s\"...\n", versionName, namespace))

	_, err := s.interactor.ActivateVersion(versionName)
	if err != nil {
		s.logger.Error(err.Error())
		return &runtimepb.ActivateVersionResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &runtimepb.ActivateVersionResponse{
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
