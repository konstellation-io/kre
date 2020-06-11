package usecase

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/kre/admin-api/domain/service"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
	"time"
)

const graphResolution = 60

type ResourceMetricsInteractor struct {
	logger                 logging.Logger
	runtimeRepo            repository.RuntimeRepo
	versionRepo            repository.VersionRepo
	resourceMetricsService service.ResourceMetricsService
}

func NewResourceMetricsInteractor(
	logger logging.Logger,
	runtimeRepo repository.RuntimeRepo,
	versionRepo repository.VersionRepo,
	resourceMetricsService service.ResourceMetricsService,
) *ResourceMetricsInteractor {
	return &ResourceMetricsInteractor{
		logger:                 logger,
		runtimeRepo:            runtimeRepo,
		versionRepo:            versionRepo,
		resourceMetricsService: resourceMetricsService,
	}
}

func (r *ResourceMetricsInteractor) Get(ctx context.Context, versionId, fromDate, toDate string) ([]*entity.ResourceMetrics, error) {
	version, err := r.versionRepo.GetByID(versionId)
	if err != nil {
		return nil, fmt.Errorf("error getting version by id: %w", err)
	}

	fmt.Println("versionObject ", version)

	runtime, err := r.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, fmt.Errorf("error getting runtime by id: %w", err)
	}

	step, err := calcResourceMetricsStep(fromDate, toDate)
	if err != nil {
		return nil, err
	}

	return r.resourceMetricsService.Get(ctx, runtime.GetNamespace(), version.Name, fromDate, toDate, step)
}

func (r *ResourceMetricsInteractor) Watch(ctx context.Context, versionId, fromDate string) (<-chan []*entity.ResourceMetrics, error) {
	version, err := r.versionRepo.GetByID(versionId)
	if err != nil {
		return nil, fmt.Errorf("error getting version by id: %w", err)
	}

	runtime, err := r.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, fmt.Errorf("error getting runtime by id: %w", err)
	}

	step, err := calcResourceMetricsStep(fromDate, "")
	if err != nil {
		return nil, err
	}

	return r.resourceMetricsService.Watch(ctx, runtime.GetNamespace(), version.Name, fromDate, step)
}

func calcResourceMetricsStep(fromDate, toDate string) (int32, error) {
	fmt.Println("Calling to calcResourceMetricsStep")
	fromDateParsed, err := time.Parse(time.RFC3339, fromDate)
	if err != nil {
		return 0, fmt.Errorf("error parsing fromDate time: %w", err)
	}

	var toDateParsed time.Time
	if toDate == "" {
		toDateParsed = time.Now()
	} else {
		toDateParsed, err = time.Parse(time.RFC3339, toDate)
		if err != nil {
			return 0, fmt.Errorf("error parsing toDate time: %w", err)
		}
	}

	finalStep := int32(toDateParsed.Sub(fromDateParsed).Seconds() / graphResolution)

	return finalStep, nil
}
