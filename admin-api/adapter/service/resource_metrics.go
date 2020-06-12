package service

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/kre/admin-api/adapter/service/proto/resourcemetricspb"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
	"google.golang.org/grpc"
	"io"
)

type ResourceMetricsService struct {
	cfg    *config.Config
	client resourcemetricspb.ResourceMetricsServiceClient
	logger logging.Logger
}

func NewResourceMetricsService(cfg *config.Config, logger logging.Logger) (*ResourceMetricsService, error) {
	cc, err := grpc.Dial(cfg.Services.K8sManager, grpc.WithInsecure())
	client := resourcemetricspb.NewResourceMetricsServiceClient(cc)
	if err != nil {
		return nil, err
	}

	return &ResourceMetricsService{
		cfg,
		client,
		logger,
	}, nil
}

// Get get resources metrics from K8s Manager
func (c *ResourceMetricsService) Get(ctx context.Context, runtimeName, versionName, fromDate, toDate string, step int32) ([]*entity.ResourceMetrics, error) {
	req := resourcemetricspb.VersionRequest{
		Namespace:   runtimeName,
		VersionName: versionName,
		FromDate:    fromDate,
		ToDate:      toDate,
		Step:        step,
	}

	res, err := c.client.GetVersion(ctx, &req)
	if err != nil {
		return nil, fmt.Errorf("error calling grpc get version resource metrics: %w", err)
	}

	return toResourceMetrics(res.GetVersionResourceMetrics()), nil
}

// Watch watch resources metrics from K8s Manager
func (c *ResourceMetricsService) Watch(ctx context.Context, runtimeName, versionName, fromDate string, step int32) (<-chan []*entity.ResourceMetrics, error) {
	req := resourcemetricspb.VersionRequest{
		Namespace:   runtimeName,
		VersionName: versionName,
		FromDate:    fromDate,
		Step:        step,
	}

	stream, err := c.client.WatchVersion(ctx, &req)
	if err != nil {
		if err != nil {
			return nil, fmt.Errorf("error calling grpc get version resource metrics: %w", err)
		}
	}

	ch := make(chan []*entity.ResourceMetrics, 1)
	go func() {
		for {
			c.logger.Info("[resource_monitoring.VersionResourceMetrics] waiting for stream.Recv()...")
			msg, err := stream.Recv()

			if err == io.EOF {
				c.logger.Info("[resource_monitoring.VersionResourceMetrics] EOF msg received. Stopping...")
				close(ch)
				return
			}

			if err != nil {
				c.logger.Error(err.Error())
				close(ch)
				return
			}

			c.logger.Info("[resource_monitoring.VersionResourceMetrics] Message received")

			ch <- toResourceMetrics(msg.GetVersionResourceMetrics())
		}
	}()

	return ch, nil
}

func toResourceMetrics(grpcMetrics []*resourcemetricspb.VersionResourceMetrics) []*entity.ResourceMetrics {
	outputMetrics := make([]*entity.ResourceMetrics, len(grpcMetrics))
	for i, grpcMetric := range grpcMetrics {
		outputMetrics[i] = &entity.ResourceMetrics{
			Date: grpcMetric.GetDate(),
			Cpu:  grpcMetric.GetCpu(),
			Mem:  grpcMetric.GetMem(),
		}
	}
	return outputMetrics
}
