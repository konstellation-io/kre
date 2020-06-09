package service

import (
	"context"
	"fmt"

	"gitlab.com/konstellation/kre/k8s-manager/entity"
	"gitlab.com/konstellation/kre/k8s-manager/prometheus/resourcemetrics"
	"gitlab.com/konstellation/kre/k8s-manager/proto/resourcemetricspb"
)

// ResourceMetricsService implements ResourceMetrics gRPC service
type ResourceMetricsService struct {
	manager *resourcemetrics.Manager
}

// NewResourceMetricsService returns a new resource metrics instance
func NewResourceMetricsService(manager *resourcemetrics.Manager) *ResourceMetricsService {

	return &ResourceMetricsService{
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
		return nil, err
	}
	fmt.Println(returnmetrics)
	return nil, nil
}

func (r *ResourceMetricsService) WatchVersion(input *resourcemetricspb.WatchVersionRequest, server resourcemetricspb.ResourceMetricsService_WatchVersionServer) error {
	return nil
}
