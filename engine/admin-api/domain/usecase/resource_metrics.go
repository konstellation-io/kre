package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/repository"
	"github.com/konstellation-io/kre/engine/admin-api/domain/service"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

const (
	graphResolution   = 15
	watchStepInterval = 59
)

type ResourceMetricsInteractor struct {
	logger                 logging.Logger
	runtimeRepo            repository.RuntimeRepo
	versionRepo            repository.VersionRepo
	resourceMetricsService service.ResourceMetricsService
	accessControl          auth.AccessControl
}

func NewResourceMetricsInteractor(
	logger logging.Logger,
	runtimeRepo repository.RuntimeRepo,
	versionRepo repository.VersionRepo,
	resourceMetricsService service.ResourceMetricsService,
	accessControl auth.AccessControl,
) *ResourceMetricsInteractor {
	return &ResourceMetricsInteractor{
		logger,
		runtimeRepo,
		versionRepo,
		resourceMetricsService,
		accessControl,
	}
}

func (r *ResourceMetricsInteractor) Get(ctx context.Context, loggedUserID, versionId, fromDate, toDate string) ([]*entity.ResourceMetrics, error) {
	if err := r.accessControl.CheckPermission(loggedUserID, auth.ResResourceMetrics, auth.ActView); err != nil {
		return nil, err
	}

	version, err := r.versionRepo.GetByID(versionId)
	if err != nil {
		return nil, fmt.Errorf("error getting version by id: %w", err)
	}

	runtime, err := r.runtimeRepo.GetByID(ctx, version.RuntimeID)
	if err != nil {
		return nil, fmt.Errorf("error getting runtime by id: %w", err)
	}

	step, err := calcResourceMetricsStep(fromDate, toDate)
	if err != nil {
		return nil, err
	}

	return r.resourceMetricsService.Get(ctx, runtime.GetNamespace(), version.Name, fromDate, toDate, step)
}

func (r *ResourceMetricsInteractor) Watch(ctx context.Context, loggedUserID, versionId, fromDate string) (<-chan []*entity.ResourceMetrics, error) {
	if err := r.accessControl.CheckPermission(loggedUserID, auth.ResResourceMetrics, auth.ActView); err != nil {
		return nil, err
	}

	version, err := r.versionRepo.GetByID(versionId)
	if err != nil {
		return nil, fmt.Errorf("error getting version by id: %w", err)
	}

	runtime, err := r.runtimeRepo.GetByID(ctx, version.RuntimeID)
	if err != nil {
		return nil, fmt.Errorf("error getting runtime by id: %w", err)
	}

	return r.resourceMetricsService.Watch(ctx, runtime.GetNamespace(), version.Name, fromDate, watchStepInterval)
}

func calcResourceMetricsStep(fromDate, toDate string) (int32, error) {
	fromDateParsed, err := time.Parse(time.RFC3339, fromDate)
	if err != nil {
		return 0, fmt.Errorf("error parsing fromDate time: %w", err)
	}

	toDateParsed, err := time.Parse(time.RFC3339, toDate)
	if err != nil {
		return 0, fmt.Errorf("error parsing toDate time: %w", err)
	}

	step := int32(toDateParsed.Sub(fromDateParsed).Seconds() / graphResolution)

	return step, nil
}
