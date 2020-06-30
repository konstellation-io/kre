package usecase_test

import (
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin-api/mocks"
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
	accessControl := mocks.NewMockAccessControl(ctrl)

	mocks.AddLoggerExpects(logger)

	metricsInteractor := usecase.NewMetricsInteractor(
		logger,
		runtimeRepo,
		monitoringService,
		accessControl,
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
			Date:  "2020-01-30T20:55:59Z",
			Error: usecase.MetricsMissingValuesKey,
		},
		{
			Date:  "2020-01-30T20:55:59Z",
			Error: usecase.MetricsNewLabelsKey,
		},
		{
			Date:           "2020-01-30T20:55:59Z",
			PredictedValue: "man",
			TrueValue:      "woman",
		},
		{
			Date:           "2020-01-30T20:56:59Z",
			PredictedValue: "woman",
			TrueValue:      "man",
		},
		{
			Date:           "2020-01-30T20:57:59Z",
			PredictedValue: "man",
			TrueValue:      "man",
		},
		{
			Date:           "2020-01-30T20:58:59Z",
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

	expectedSuccessVsFails := []*entity.MetricChartData{
		{
			X: "30 Jan 2020 20:00 UTC",
			Y: "50",
		},
	}
	require.Equal(t, expectedSuccessVsFails, result.Charts.SuccessVsFails)
}

func TestMetricsInteractor_GetSuccessVsFailsChartWithOneMetric(t *testing.T) {
	s := newMetricsSuite(t)
	defer s.ctrl.Finish()

	metrics := []entity.MetricRow{
		{
			Date:           "2020-01-30T00:00:00Z",
			PredictedValue: "man",
			TrueValue:      "woman",
		},
	}

	expectedChart := []*entity.MetricChartData{
		{
			X: "30 Jan 2020 00:00 UTC",
			Y: "0",
		},
	}

	chart, err := s.metricsInteractor.GetSuccessVsFailsChart(metrics)
	require.Nil(t, err)
	require.Equal(t, expectedChart, chart)
}

func TestMetricsInteractor_GetSuccessVsFailsChartWithSmallInterval(t *testing.T) {
	s := newMetricsSuite(t)
	defer s.ctrl.Finish()

	metrics := []entity.MetricRow{
		{
			Date:           "2020-01-30T00:00:00Z",
			PredictedValue: "man",
			TrueValue:      "woman",
		},
		{
			Date:           "2020-01-30T01:00:00Z",
			PredictedValue: "woman",
			TrueValue:      "man",
		},
		{
			Date:           "2020-01-30T01:00:00Z",
			PredictedValue: "man",
			TrueValue:      "man",
		},
		{
			Date:           "2020-01-30T03:00:00Z",
			PredictedValue: "woman",
			TrueValue:      "woman",
		},
	}

	expectedChart := []*entity.MetricChartData{
		{
			X: "30 Jan 2020 00:00 UTC",
			Y: "0",
		},
		{
			X: "30 Jan 2020 01:00 UTC",
			Y: "50",
		},
		{
			X: "30 Jan 2020 02:00 UTC",
			Y: "",
		},
		{
			X: "30 Jan 2020 03:00 UTC",
			Y: "100",
		},
	}

	chart, err := s.metricsInteractor.GetSuccessVsFailsChart(metrics)
	require.Nil(t, err)
	require.Equal(t, expectedChart, chart)
}

func TestMetricsInteractor_GetSuccessVsFailsChartWithNoTruncatedTime(t *testing.T) {
	s := newMetricsSuite(t)
	defer s.ctrl.Finish()

	metrics := []entity.MetricRow{
		{
			Date:           "2020-01-30T20:55:59Z",
			PredictedValue: "man",
			TrueValue:      "woman",
		},
		{
			Date:           "2020-01-30T21:10:11Z",
			PredictedValue: "woman",
			TrueValue:      "man",
		},
		{
			Date:           "2020-01-30T22:00:01Z",
			PredictedValue: "man",
			TrueValue:      "man",
		},
		{
			Date:           "2020-01-31T02:05:01Z",
			PredictedValue: "woman",
			TrueValue:      "woman",
		},
	}

	expectedChart := []*entity.MetricChartData{
		{
			X: "30 Jan 2020 20:00 UTC",
			Y: "0",
		},
		{
			X: "30 Jan 2020 21:00 UTC",
			Y: "0",
		},
		{
			X: "30 Jan 2020 22:00 UTC",
			Y: "100",
		},
		{
			X: "30 Jan 2020 23:00 UTC",
			Y: "",
		},
		{
			X: "31 Jan 2020 00:00 UTC",
			Y: "",
		},
		{
			X: "31 Jan 2020 01:00 UTC",
			Y: "",
		},
		{
			X: "31 Jan 2020 02:00 UTC",
			Y: "100",
		},
	}

	chart, err := s.metricsInteractor.GetSuccessVsFailsChart(metrics)
	require.Nil(t, err)
	require.Equal(t, expectedChart, chart)
}

func TestMetricsInteractor_GetSuccessVsFailsChartWithLongInterval(t *testing.T) {
	s := newMetricsSuite(t)
	defer s.ctrl.Finish()

	metrics := []entity.MetricRow{
		{
			Date:           "2020-01-30T00:55:59Z",
			PredictedValue: "man",
			TrueValue:      "woman",
		},
		{
			Date:           "2020-01-30T21:10:11Z",
			PredictedValue: "woman",
			TrueValue:      "man",
		},
		{
			Date:           "2020-02-04T22:00:01Z",
			PredictedValue: "man",
			TrueValue:      "man",
		},
		{
			Date:           "2020-02-10T02:05:01Z",
			PredictedValue: "woman",
			TrueValue:      "woman",
		},
	}

	expectedChart := []*entity.MetricChartData{
		{
			X: "30 Jan 2020",
			Y: "0",
		},
		{
			X: "31 Jan 2020",
			Y: "",
		},
		{
			X: "1 Feb 2020",
			Y: "",
		},
		{
			X: "2 Feb 2020",
			Y: "",
		},
		{
			X: "3 Feb 2020",
			Y: "",
		},
		{
			X: "4 Feb 2020",
			Y: "100",
		},
		{
			X: "5 Feb 2020",
			Y: "",
		},
		{
			X: "6 Feb 2020",
			Y: "",
		},
		{
			X: "7 Feb 2020",
			Y: "",
		},
		{
			X: "8 Feb 2020",
			Y: "",
		},
		{
			X: "9 Feb 2020",
			Y: "",
		},
		{
			X: "10 Feb 2020",
			Y: "100",
		},
	}

	chart, err := s.metricsInteractor.GetSuccessVsFailsChart(metrics)
	require.Nil(t, err)
	require.Equal(t, expectedChart, chart)
}

func TestMetricsInteractor_GetSuccessVsFailsChartWithUnordered(t *testing.T) {
	s := newMetricsSuite(t)
	defer s.ctrl.Finish()

	metrics := []entity.MetricRow{
		{
			Date:           "2020-01-30T01:00:00Z",
			PredictedValue: "woman",
			TrueValue:      "man",
		},
		{
			Date:           "2020-01-30T03:00:00Z",
			PredictedValue: "woman",
			TrueValue:      "woman",
		},
		{
			Date:           "2020-01-30T01:00:00Z",
			PredictedValue: "man",
			TrueValue:      "man",
		},
		{
			Date:           "2020-01-30T00:00:00Z",
			PredictedValue: "man",
			TrueValue:      "woman",
		},
	}

	expectedChart := []*entity.MetricChartData{
		{
			X: "30 Jan 2020 00:00 UTC",
			Y: "0",
		},
		{
			X: "30 Jan 2020 01:00 UTC",
			Y: "50",
		},
		{
			X: "30 Jan 2020 02:00 UTC",
			Y: "",
		},
		{
			X: "30 Jan 2020 03:00 UTC",
			Y: "100",
		},
	}

	chart, err := s.metricsInteractor.GetSuccessVsFailsChart(metrics)
	require.Nil(t, err)
	require.Equal(t, expectedChart, chart)
}
