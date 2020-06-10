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
	x := &entity.InputVersionResourceMetrics{
		VersionRequest: *req,
	}

	returnmetrics, err := r.manager.GetVersionResourceMetrics(x)
	if err != nil {
		r.logger.Errorf("Error getting metrics: %v", err)
		return nil, err
	}

	m := make([]*resourcemetricspb.VersionResourceMetrics, len(returnmetrics))
	for i, v := range returnmetrics {
		m[i] = &resourcemetricspb.VersionResourceMetrics{
			Date: v.Date.String(),
			Cpu:  v.CPU,
			Mem:  v.Mem,
		}
	}
	response := &resourcemetricspb.Response{
		VersionResourceMetrics: m,
	}

	return response, nil
}

// WatchVersion return stream current version metrics
func (r *ResourceMetricsService) WatchVersion(input *resourcemetricspb.WatchVersionRequest, server resourcemetricspb.ResourceMetricsService_WatchVersionServer) error {
	return nil
}
