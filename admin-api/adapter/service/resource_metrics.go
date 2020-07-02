package service

import (
	"context"
	"fmt"
	"io"

	"google.golang.org/grpc"

	"github.com/konstellation-io/kre/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin-api/adapter/service/proto/resourcemetricspb"
	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
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
	c.logger.Info("[ResourceMetricsService.Watch] opening stream with runtime-api...")
	stream, err := c.client.WatchVersion(ctx, &resourcemetricspb.VersionRequest{
		Namespace:   runtimeName,
		VersionName: versionName,
		FromDate:    fromDate,
		Step:        step,
	})
	if err != nil {
		return nil, fmt.Errorf("calling watch version resources: %w", err)
	}

	ch := make(chan []*entity.ResourceMetrics, 1)
	go func() {
		defer close(ch)

		for {
			c.logger.Debug("[ResourceMetricsService.Watch] waiting for stream.Recv()...")
			msg, err := stream.Recv()

			if stream.Context().Err() == context.Canceled {
				c.logger.Debug("[ResourceMetricsService.Watch] Context canceled")
				return
			}

			if err == io.EOF {
				c.logger.Debug("[ResourceMetricsService.Watch] EOF msg received. Stopping...")
				return
			}

			if err != nil {
				c.logger.Errorf("[ResourceMetricsService.Watch] stream.Recv error: %s", err)
				return
			}

			c.logger.Debug("[ResourceMetricsService.Watch] Message received")

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
