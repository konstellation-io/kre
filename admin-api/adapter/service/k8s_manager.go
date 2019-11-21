package service

import (
	"context"
	"errors"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/runtimepb"
	"google.golang.org/grpc"
)

type K8sManagerServiceGRPC struct {
	cfg    *config.Config
	logger logging.Logger
}

func NewK8sManagerServiceGRPC(cfg *config.Config, logger logging.Logger) *K8sManagerServiceGRPC {
	return &K8sManagerServiceGRPC{
		cfg,
		logger,
	}
}

func (k *K8sManagerServiceGRPC) CreateRuntime(name string) (string, error) {
	cc, err := grpc.Dial(k.cfg.Services.K8sManager, grpc.WithInsecure())
	if err != nil {
		return "", err
	}

	defer func() {
		err := cc.Close()
		if err != nil {
			k.logger.Error(err.Error())
		}
	}()

	c := runtimepb.NewRuntimeServiceClient(cc)

	req := runtimepb.CreateRuntimeRequest{
		Runtime: &runtimepb.Runtime{
			Name: name,
		},
	}

	res, err := c.CreateRuntime(context.Background(), &req) // TODO timeout
	if err != nil {
		return "", err
	}

	if !res.GetSuccess() {
		return "", errors.New(res.GetMessage())
	}

	return res.GetMessage(), nil
}
