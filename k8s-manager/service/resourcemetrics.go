package service

import (
	"context"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"github.com/konstellation-io/kre/k8s-manager/entity"
	"github.com/konstellation-io/kre/k8s-manager/prometheus/resourcemetrics"
	"github.com/konstellation-io/kre/k8s-manager/proto/resourcemetricspb"
)

// ResourceMetricsService implements ResourceMetrics gRPC service.
type ResourceMetricsService struct {
	logger  *simplelogger.SimpleLogger
	manager *resourcemetrics.Manager
}

// NewResourceMetricsService returns a new resource metrics instance.
func NewResourceMetricsService(
	logger *simplelogger.SimpleLogger,
	manager *resourcemetrics.Manager,
) *ResourceMetricsService {
	return &ResourceMetricsService{
		logger,
		manager,
	}
}

// GetVersion returns a stream with metrics on the requested interval.
func (r *ResourceMetricsService) GetVersion(
	_ context.Context,
	req *resourcemetricspb.VersionRequest,
) (*resourcemetricspb.Response, error) {
	input := &entity.InputVersionResourceMetrics{
		VersionRequest: *req,
	}

	r.logger.Infof("Getting metrics for version ", input.VersionRequest)
	metrics, err := r.manager.GetVersionResourceMetrics(input)
	if err != nil {
		r.logger.Errorf("Error getting metrics: %v", err)
		return nil, err
	}

	return toVersionResourceMetricsResponse(metrics), nil
}

// WatchVersion return stream current version metrics.
func (r *ResourceMetricsService) WatchVersion(
	req *resourcemetricspb.VersionRequest,
	stream resourcemetricspb.ResourceMetricsService_WatchVersionServer,
) error {
	input := &entity.InputVersionResourceMetrics{
		VersionRequest: *req,
	}

	ctx := stream.Context()
	metricsCh := make(chan []entity.VersionResourceMetrics, 1)

	err := r.manager.WatchVersionResourceMetrics(ctx, input, metricsCh)
	if err != nil {
		return err
	}

	for m := range metricsCh {
		err := stream.Send(toVersionResourceMetricsResponse(m))

		if err != nil {
			r.logger.Info("[ResourceMetricsService.WatchVersion] error sending to client: %s")
			r.logger.Error(err.Error())

			return err
		}
	}

	return nil
}

func toVersionResourceMetricsResponse(metrics []entity.VersionResourceMetrics) *resourcemetricspb.Response {
	result := make([]*resourcemetricspb.VersionResourceMetrics, len(metrics))
	for i, v := range metrics {
		result[i] = &resourcemetricspb.VersionResourceMetrics{
			Date: v.Date.Format(time.RFC3339),
			Cpu:  v.CPU,
			Mem:  v.Mem,
		}
	}

	return &resourcemetricspb.Response{
		VersionResourceMetrics: result,
	}
}
