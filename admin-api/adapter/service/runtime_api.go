package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/iancoleman/strcase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/runtimepb"
	"google.golang.org/grpc"
	"time"
)

type RuntimeAPIServiceGRPC struct {
	cfg    *config.Config
	logger logging.Logger
}

func NewRuntimeAPIServiceGRPC(cfg *config.Config, logger logging.Logger) *RuntimeAPIServiceGRPC {
	return &RuntimeAPIServiceGRPC{
		cfg,
		logger,
	}
}

func (k *RuntimeAPIServiceGRPC) DeployVersion(runtime *entity.Runtime, versionName string) error {
	ns := strcase.ToKebab(runtime.Name)
	cc, err := grpc.Dial(fmt.Sprintf("runtime-api.%s:50051", ns), grpc.WithInsecure()) // TODO get port

	if err != nil {
		return err
	}

	defer func() {
		err := cc.Close()
		if err != nil {
			k.logger.Error(err.Error())
		}
	}()

	c := runtimepb.NewRuntimeServiceClient(cc)

	req := runtimepb.DeployVersionRequest{
		Version: &runtimepb.Version{
			Name: versionName,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	res, err := c.DeployVersion(ctx, &req)
	if err != nil {
		return err
	}

	if !res.GetSuccess() {
		return errors.New(res.GetMessage())
	}

	return nil
}

func (k *RuntimeAPIServiceGRPC) ActivateVersion(runtime *entity.Runtime, versionName string) error {
	ns := strcase.ToKebab(runtime.Name)
	cc, err := grpc.Dial("runtime-api."+ns, grpc.WithInsecure())
	if err != nil {
		return err
	}

	defer func() {
		err := cc.Close()
		if err != nil {
			k.logger.Error(err.Error())
		}
	}()

	c := runtimepb.NewRuntimeServiceClient(cc)

	req := runtimepb.ActivateVersionRequest{
		Version: &runtimepb.Version{
			Name: versionName,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	res, err := c.ActivateVersion(ctx, &req)
	if err != nil {
		return err
	}

	if !res.GetSuccess() {
		return errors.New(res.GetMessage())
	}

	return nil
}
