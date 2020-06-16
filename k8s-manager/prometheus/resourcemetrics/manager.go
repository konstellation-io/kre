package resourcemetrics

import (
	"context"
	"fmt"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"github.com/prometheus/common/model"

	"github.com/konstellation-io/kre/k8s-manager/config"
	"github.com/konstellation-io/kre/k8s-manager/entity"
)

const refreshInterval = 60 * time.Second

// Manager contains methods to call Prometheus.
type Manager struct {
	config     *config.Config
	logger     *simplelogger.SimpleLogger
	prometheus v1.API
}

// New returns an instance of the Prometheus manager.
func New(config *config.Config, logger *simplelogger.SimpleLogger) (*Manager, error) {
	client, err := api.NewClient(api.Config{
		Address: config.Prometheus.URL,
	})
	if err != nil {
		logger.Errorf("Error creating Prometheus client: %v\n", err.Error())
		return nil, err
	}

	prometheus := v1.NewAPI(client)

	return &Manager{
		config,
		logger,
		prometheus,
	}, nil
}

// GetVersionResourceMetrics get from Prometheus the resource usage for a specific version.
func (m *Manager) GetVersionResourceMetrics(
	input *entity.InputVersionResourceMetrics,
) ([]entity.VersionResourceMetrics, error) {
	fromDate, err := time.Parse(time.RFC3339, input.FromDate)
	if err != nil {
		return nil, fmt.Errorf("invalid fromDate: %w", err)
	}

	toDate, err := time.Parse(time.RFC3339, input.ToDate)
	if err != nil {
		return nil, fmt.Errorf("invalid toDate: %w", err)
	}

	step := time.Duration(input.Step) * time.Second

	return m.prometheusQuery(fromDate, toDate, step, input.VersionName, input.Namespace)
}

// WatchVersionResourceMetrics call to Prometheus and return to channel the metrics for gRPC server.
func (m *Manager) WatchVersionResourceMetrics(
	ctx context.Context,
	input *entity.InputVersionResourceMetrics,
	metricsCh chan<- []entity.VersionResourceMetrics,
) error {
	ticker := time.NewTicker(refreshInterval)

	fromDate, err := time.Parse(time.RFC3339, input.FromDate)
	if err != nil {
		return fmt.Errorf("invalid fromDate: %w", err)
	}

	step := time.Duration(input.Step) * time.Second

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				toDate := time.Now()

				metrics, err := m.prometheusQuery(fromDate, toDate, step, input.VersionName, input.Namespace)
				if err != nil {
					m.logger.Errorf("error performing the Prometheus query: %s", err)
					return
				}

				fromDate = toDate

				if len(metrics) > 1 {
					metrics = metrics[1:]
				}

				metricsCh <- metrics
			}
		}
	}()

	return nil
}

func (m *Manager) prometheusQuery(
	fromDate, toDate time.Time,
	step time.Duration,
	versionName, namespace string,
) ([]entity.VersionResourceMetrics, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	r := v1.Range{
		Start: fromDate,
		End:   toDate,
		Step:  step,
	}

	cpuQuery := fmt.Sprintf(`sum (
		max(kube_pod_labels{label_version_name='%s'}) by(label_version_name, pod) * on (pod) group_right(label_version_name)
		label_replace(
			 sum by (pod_name)(
				  rate(container_cpu_usage_seconds_total{namespace='%s'}[5m])*1000
			 ), 'pod', '$1', 'pod_name', '(.+)'
		)
	 ) by (label_version_name)`, versionName, namespace)

	cpuResult, warnings, err := m.prometheus.QueryRange(ctx, cpuQuery, r)
	if err != nil {
		m.logger.Errorf("Error querying Prometheus: %v\n", err.Error())
		return nil, err
	}

	if len(warnings) > 0 {
		m.logger.Infof("Warnings: %v\n", warnings)
	}

	memQuery := fmt.Sprintf(`sum (
		max(kube_pod_labels{label_version_name='%s'}) by(label_version_name, pod) * on (pod) group_right(label_version_name)
		label_replace(
			 sum by (pod_name)(
				  container_memory_working_set_bytes{namespace='%s', container_name!="POD",container_name!=""}
			 ), 'pod', '$1', 'pod_name', '(.+)'
		)
	 ) by (label_version_name)`, versionName, namespace)

	memResult, warnings, err := m.prometheus.QueryRange(ctx, memQuery, r)
	if err != nil {
		m.logger.Errorf("Error querying Prometheus: %v\n", err.Error())
		return nil, err
	}

	if len(warnings) > 0 {
		m.logger.Infof("Warnings: %v\n", warnings)
	}

	cpuMetric := cpuResult.(model.Matrix)
	memMetric := memResult.(model.Matrix)

	if len(cpuMetric) == 0 || len(memMetric) == 0 {
		return []entity.VersionResourceMetrics{}, nil
	}

	cpuValues := cpuMetric[0]
	memValues := memMetric[0]

	lenMemValues := len(memValues.Values)
	result := make([]entity.VersionResourceMetrics, len(cpuValues.Values))

	for i, v := range cpuValues.Values {
		var mem float64
		if i <= lenMemValues {
			mem = float64(memValues.Values[i].Value)
		}

		result[i] = entity.VersionResourceMetrics{
			Date: v.Timestamp.Time(),
			CPU:  float64(v.Value),
			Mem:  mem,
		}
	}

	return result, nil
}
