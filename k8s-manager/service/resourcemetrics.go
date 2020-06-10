package service

import (
	"context"

	"gitlab.com/konstellation/kre/k8s-manager/entity"
	"gitlab.com/konstellation/kre/k8s-manager/prometheus/resourcemetrics"
	"gitlab.com/konstellation/kre/k8s-manager/proto/resourcemetricspb"
	"gitlab.com/konstellation/kre/libs/simplelogger"
)

// ResourceMetricsService implements ResourceMetrics gRPC service
type ResourceMetricsService struct {
	logger  *simplelogger.SimpleLogger
	manager *resourcemetrics.Manager
}

// NewResourceMetricsService returns a new resource metrics instance
func NewResourceMetricsService(logger *simplelogger.SimpleLogger, manager *resourcemetrics.Manager) *ResourceMetricsService {

	return &ResourceMetricsService{
		logger,
		manager,
	}
}

// GetVersion returns a stream with metrics on the requested interval
func (r *ResourceMetricsService) GetVersion(ctx context.Context, req *resourcemetricspb.VersionRequest) (*resourcemetricspb.Response, error) {
	input := &entity.InputVersionResourceMetrics{
		VersionRequest: *req,
	}

	metrics, err := r.manager.GetVersionResourceMetrics(input)
	if err != nil {
		r.logger.Errorf("Error getting metrics: %v", err)
		return nil, err
	}

	return toVersionResourceMetricsResponse(metrics), nil
}

// WatchVersion return stream current version metrics
func (r *ResourceMetricsService) WatchVersion(req *resourcemetricspb.VersionRequest, stream resourcemetricspb.ResourceMetricsService_WatchVersionServer) error {
	input := &entity.InputVersionResourceMetrics{
		VersionRequest: *req,
	}

	ctx := stream.Context()
	metricsCh := make(chan []entity.VersionResourceMetrics, 1)
	r.manager.WatchVersionResourceMetrics(ctx, input, metricsCh)

	for {
		select {
		case m := <-metricsCh:
			err := stream.Send(toVersionResourceMetricsResponse(m))

			if err != nil {
				r.logger.Info("[MonitoringService.NodeLogs] error sending to client: %s")
				r.logger.Error(err.Error())
				return err
			}
		}
	}
}

func toVersionResourceMetricsResponse(metrics []entity.VersionResourceMetrics) *resourcemetricspb.Response {
	result := make([]*resourcemetricspb.VersionResourceMetrics, len(metrics))
	for i, v := range metrics {
		result[i] = &resourcemetricspb.VersionResourceMetrics{
			Date: v.Date.String(),
			Cpu:  v.CPU,
			Mem:  v.Mem,
		}
	}
	return &resourcemetricspb.Response{
		VersionResourceMetrics: result,
	}

}
