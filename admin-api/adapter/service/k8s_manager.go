package service

import (
	"context"
	"errors"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/runtimepb"
	"google.golang.org/grpc"
	"time"
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	res, err := c.CreateRuntime(ctx, &req)
	if err != nil {
		return "", err
	}

	if !res.GetSuccess() {
		return "", errors.New(res.GetMessage())
	}

	return res.GetMessage(), nil
}

func (k *K8sManagerServiceGRPC) CheckRuntimeIsCreated(name string) (bool, error) {
	cc, err := grpc.Dial(k.cfg.Services.K8sManager, grpc.WithInsecure())
	if err != nil {
		return false, err
	}

	defer func() {
		err := cc.Close()
		if err != nil {
			k.logger.Error(err.Error())
		}
	}()

	c := runtimepb.NewRuntimeServiceClient(cc)

	req := runtimepb.CheckRuntimeIsCreatedRequest{
		Name: name,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	res, err := c.CheckRuntimeIsCreated(ctx, &req)
	if err != nil {
		return false, err
	}

	if !res.GetSuccess() {
		return false, errors.New(res.GetMessage())
	}

	return res.GetSuccess(), nil
}
