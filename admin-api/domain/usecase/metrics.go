package usecase

import (
	"context"
	"fmt"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/kre/admin-api/domain/service"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
	"sort"
	"strconv"
)

const MetricsNewLabelsKey = "new_labels"
const MetricsMissingValuesKey = "missing_values"

type MetricsInteractor struct {
	logger            logging.Logger
	runtimeRepo       repository.RuntimeRepo
	monitoringService service.MonitoringService
}

func NewMetricsInteractor(logger logging.Logger, runtimeRepo repository.RuntimeRepo, monitoringService service.MonitoringService) *MetricsInteractor {
	return &MetricsInteractor{
		logger:            logger,
		runtimeRepo:       runtimeRepo,
		monitoringService: monitoringService,
	}
}

func (i *MetricsInteractor) GetMetrics(ctx context.Context, runtimeID string, versionID string, startDate string, endDate string) (*entity.Metrics, error) {
	var result *entity.Metrics
	runtime, err := i.runtimeRepo.GetByID(runtimeID)
	if err != nil {
		return result, err
	}
	rows, err := i.monitoringService.GetMetrics(ctx, runtime, versionID, startDate, endDate)
	if err != nil {
		return result, fmt.Errorf("error getting metrics: %w", err)
	}

	return i.CalculateChartsAndValues(rows)
}

func (i *MetricsInteractor) CalculateChartsAndValues(metrics []entity.MetricRow) (*entity.Metrics, error) {
	hits := 0 // items classified correctly
	newLabels := 0
	missingValues := 0
	total := len(metrics) // all items classified including errors
	totalNoErrors := 0    // all items classified
	confusion := make(map[string]map[string]int)
	categories := make(map[string]bool) // will store all categories names
	totalByCat := make(map[string]int)
	hitsByCat := make(map[string]int)
	recallByCat := make(map[string]int)

	for _, m := range metrics {
		if m.Error == MetricsNewLabelsKey {
			newLabels += 1
		} else if m.Error == MetricsMissingValuesKey {
			missingValues += 1
		} else if m.Error != "" {
			i.logger.Errorf("unexpected metric error value = '%s'", m.Error)
		} else {
			totalNoErrors += 1

			categories[m.TrueValue] = true
			categories[m.PredictedValue] = true

			if m.TrueValue == m.PredictedValue {
				hits += 1
				hitsByCat[m.TrueValue] += 1
			}
			totalByCat[m.TrueValue] += 1

			if confusion[m.TrueValue] == nil {
				confusion[m.TrueValue] = make(map[string]int)
			}
			confusion[m.TrueValue][m.PredictedValue] += 1
		}
	}

	var allCategories []string
	for k := range categories {
		allCategories = append(allCategories, k)
	}
	sort.Strings(allCategories)

	var confusionMatrix []*entity.MetricChartData
	for _, expectedCat := range allCategories {
		for _, predictedCat := range allCategories {
			val := int((float64(confusion[expectedCat][predictedCat]) / float64(totalByCat[expectedCat])) * 100)

			confusionMatrix = append(confusionMatrix, &entity.MetricChartData{
				X: predictedCat,
				Y: expectedCat,
				Z: strconv.Itoa(val),
			})

			if expectedCat == predictedCat {
				recallByCat[expectedCat] = val
			}
		}
	}

	accuracyByCat := make(map[string]float64)
	sumAccuracies := float64(0)
	for _, cat := range allCategories {
		accuracyByCat[cat] = float64(hitsByCat[cat]) / float64(totalByCat[cat])
		sumAccuracies += accuracyByCat[cat]
	}

	// Accuracy Macro = cat 1 accuracy + cat N accuracy / Number of categories
	numCategories := float64(len(allCategories))
	accuracyMacro := int((sumAccuracies / numCategories) * 100)

	// Accuracy = items classified correctly / all items classified
	// TP_A / (TP_A + FP_A)
	accuracyTotal := int((float64(hits) / float64(totalNoErrors)) * 100)

	// Weighted Accuracy = (Acc Cat 1 * Total Cat 1) + (Acc Cat N * Total Cat N) / Total samples
	accuracyWeighted := 0.0
	for _, cat := range allCategories {
		accuracyWeighted += accuracyByCat[cat] * float64(totalByCat[cat])
	}
	accuracyWeighted = accuracyWeighted / float64(totalNoErrors)

	var seriesAccuracy []*entity.MetricChartData
	for _, cat := range allCategories {
		seriesAccuracy = append(seriesAccuracy, &entity.MetricChartData{
			X: strconv.Itoa(int(accuracyByCat[cat] * 100)),
			Y: cat,
		})
	}

	// recall is the diagonal of the confusion matrix (tp / (tp + fn))
	var seriesRecall []*entity.MetricChartData
	for _, cat := range allCategories {
		seriesRecall = append(seriesRecall, &entity.MetricChartData{
			X: strconv.Itoa(recallByCat[cat]),
			Y: cat,
		})
	}

	// support is the num of elements per each class
	var seriesSupport []*entity.MetricChartData
	for _, cat := range allCategories {
		seriesSupport = append(seriesSupport, &entity.MetricChartData{
			X: strconv.Itoa(totalByCat[cat]),
			Y: cat,
		})
	}

	return &entity.Metrics{
		Values: &entity.MetricsValues{
			Accuracy: &entity.MetricsAccuracy{
				Total:    accuracyTotal,
				Micro:    accuracyTotal, // TODO should the accuracy total and micro be the same?
				Macro:    accuracyMacro,
				Weighted: int(accuracyWeighted * 100),
			},
			Missing:   int((float64(missingValues) / float64(total)) * 100),
			NewLabels: int((float64(newLabels) / float64(total)) * 100),
		},
		Charts: &entity.MetricsCharts{
			ConfusionMatrix: confusionMatrix,
			SeriesAccuracy:  seriesAccuracy,
			SeriesRecall:    seriesRecall,
			SeriesSupport:   seriesSupport,
		},
	}, nil
}
