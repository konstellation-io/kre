package usecase_test

import (
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/mocks"
	"testing"
)

type metricsSuite struct {
	ctrl              *gomock.Controller
	metricsInteractor *usecase.MetricsInteractor
	mocks             metricsSuiteMocks
}

type metricsSuiteMocks struct {
	logger            *mocks.MockLogger
	runtimeRepo       *mocks.MockRuntimeRepo
	monitoringService *mocks.MockMonitoringService
}

func newMetricsSuite(t *testing.T) *metricsSuite {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	runtimeRepo := mocks.NewMockRuntimeRepo(ctrl)
	monitoringService := mocks.NewMockMonitoringService(ctrl)

	mocks.AddLoggerExpects(logger)

	metricsInteractor := usecase.NewMetricsInteractor(
		logger,
		runtimeRepo,
		monitoringService,
	)

	return &metricsSuite{
		ctrl:              ctrl,
		metricsInteractor: metricsInteractor,
		mocks: metricsSuiteMocks{
			logger:            logger,
			runtimeRepo:       runtimeRepo,
			monitoringService: monitoringService,
		},
	}
}

func TestMetricsInteractor_CalculateMetrics(t *testing.T) {
	s := newMetricsSuite(t)
	defer s.ctrl.Finish()

	rows := []entity.MetricRow{
		{
			Error: usecase.MetricsMissingValuesKey,
		},
		{
			Error: usecase.MetricsNewLabelsKey,
		},
		{
			PredictedValue: "man",
			TrueValue:      "woman",
		},
		{
			PredictedValue: "woman",
			TrueValue:      "man",
		},
		{
			PredictedValue: "man",
			TrueValue:      "man",
		},
		{
			PredictedValue: "woman",
			TrueValue:      "woman",
		},
	}

	result, err := s.metricsInteractor.CalculateChartsAndValues(rows)
	require.Nil(t, err)

	expectedMetricsValues := &entity.MetricsValues{
		Accuracy: &entity.MetricsAccuracy{
			Total:    50,
			Micro:    50,
			Macro:    50,
			Weighted: 50,
		},
		Missing:   16,
		NewLabels: 16,
	}
	require.Equal(t, expectedMetricsValues, result.Values)

	expectedConfusionMatrix := []*entity.MetricChartData{
		{
			X: "man",
			Y: "man",
			Z: "50",
		},
		{
			X: "woman",
			Y: "man",
			Z: "50",
		},
		{
			X: "man",
			Y: "woman",
			Z: "50",
		},
		{
			X: "woman",
			Y: "woman",
			Z: "50",
		},
	}
	require.Equal(t, expectedConfusionMatrix, result.Charts.ConfusionMatrix)

	expectedSeriesAccuracy := []*entity.MetricChartData{
		{
			X: "50",
			Y: "man",
		},
		{
			X: "50",
			Y: "woman",
		},
	}
	require.Equal(t, expectedSeriesAccuracy, result.Charts.SeriesAccuracy)

	expectedSeriesRecall := []*entity.MetricChartData{
		{
			X: "50",
			Y: "man",
		},
		{
			X: "50",
			Y: "woman",
		},
	}
	require.Equal(t, expectedSeriesRecall, result.Charts.SeriesRecall)

	expectedSeriesSupport := []*entity.MetricChartData{
		{
			X: "2",
			Y: "man",
		},
		{
			X: "2",
			Y: "woman",
		},
	}
	require.Equal(t, expectedSeriesSupport, result.Charts.SeriesSupport)
}
