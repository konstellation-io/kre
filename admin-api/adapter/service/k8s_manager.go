package service

import (
	"context"
	"errors"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/k8smanagerpb"
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

func (k *K8sManagerServiceGRPC) CreateRuntime(runtime *entity.Runtime) (string, error) {
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

	c := k8smanagerpb.NewRuntimeServiceClient(cc)

	req := k8smanagerpb.CreateRuntimeRequest{
		Runtime: &k8smanagerpb.Runtime{
			Name: runtime.Name,
			Minio: &k8smanagerpb.Runtime_MinioConf{
				AccessKey: runtime.Minio.AccessKey,
				SecretKey: runtime.Minio.SecretKey,
			},
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

func (k *K8sManagerServiceGRPC) CheckRuntimeIsCreated(name string) error {
	cc, err := grpc.Dial(k.cfg.Services.K8sManager, grpc.WithInsecure())
	if err != nil {
		return err
	}

	defer func() {
		err := cc.Close()
		if err != nil {
			k.logger.Error(err.Error())
		}
	}()

	c := k8smanagerpb.NewRuntimeServiceClient(cc)

	req := k8smanagerpb.CheckRuntimeIsCreatedRequest{
		Name: name,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	res, err := c.CheckRuntimeIsCreated(ctx, &req)
	if err != nil {
		return err
	}

	if !res.GetSuccess() {
		return errors.New(res.GetMessage())
	}

	return nil
}
