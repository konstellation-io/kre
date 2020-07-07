package service

import (
	"context"
	"google.golang.org/grpc"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/service/proto/runtimepb"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
)

type K8sRuntimeClient struct {
	cfg    *config.Config
	logger logging.Logger
	client runtimepb.RuntimeServiceClient
}

func NewK8sRuntimeClient(cfg *config.Config, logger logging.Logger) (*K8sRuntimeClient, error) {
	cc, err := grpc.Dial(cfg.Services.K8sManager, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	client := runtimepb.NewRuntimeServiceClient(cc)

	return &K8sRuntimeClient{
		cfg,
		logger,
		client,
	}, nil
}

func (k *K8sRuntimeClient) Create(ctx context.Context, runtime *entity.Runtime) (string, error) {
	req := runtimepb.Request{
		Runtime: &runtimepb.Runtime{
			Name:      runtime.Name,
			Namespace: runtime.GetNamespace(),
			Mongo: &runtimepb.Runtime_MongoConf{
				Username:  runtime.Mongo.Username,
				Password:  runtime.Mongo.Password,
				SharedKey: runtime.Mongo.SharedKey,
			},
			Minio: &runtimepb.Runtime_MinioConf{
				AccessKey: runtime.Minio.AccessKey,
				SecretKey: runtime.Minio.SecretKey,
			},
		},
	}

	res, err := k.client.Create(ctx, &req)
	if err != nil {
		return "", err
	}

	return res.GetMessage(), nil
}

func (k *K8sRuntimeClient) WaitForRuntimeStarted(ctx context.Context, runtime *entity.Runtime) (*entity.RuntimeStatusEntity, error) {
	cc, err := grpc.Dial(k.cfg.Services.K8sManager, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	defer func() {
		err := cc.Close()
		if err != nil {
			k.logger.Error(err.Error())
		}
	}()

	c := runtimepb.NewRuntimeServiceClient(cc)

	req := &runtimepb.Request{
		Runtime: &runtimepb.Runtime{
			Namespace: runtime.GetNamespace(),
		},
	}

	res, err := c.RuntimeStatus(ctx, req)
	if err != nil {
		return nil, err
	}

	return &entity.RuntimeStatusEntity{
		Status: res.Status,
	}, nil
}
