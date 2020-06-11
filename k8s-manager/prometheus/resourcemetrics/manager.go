package resourcemetrics

import (
	"context"
	"fmt"
	"time"

	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"github.com/prometheus/common/model"
	"gitlab.com/konstellation/kre/k8s-manager/config"
	"gitlab.com/konstellation/kre/k8s-manager/entity"
	"gitlab.com/konstellation/kre/libs/simplelogger"
)

// Manager contains methods to call Prometheus
type Manager struct {
	config     *config.Config
	logger     *simplelogger.SimpleLogger
	prometheus v1.API
}

// New returns an instance of the Prometheus manager
func New(config *config.Config, logger *simplelogger.SimpleLogger) (*Manager, error) {
	client, err := api.NewClient(api.Config{
		Address: config.Prometheus.Url,
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

// GetVersionResourceMetrics get from Prometheus the resource usage for a specific version
func (m *Manager) GetVersionResourceMetrics(input *entity.InputVersionResourceMetrics) ([]entity.VersionResourceMetrics, error) {
	fromDate, err := time.Parse(time.RFC3339, input.FromDate)
	if err != nil {
		return nil, fmt.Errorf("Invalid fromDate: %w", err)
	}

	toDate, err := time.Parse(time.RFC3339, input.ToDate)
	if err != nil {
		return nil, fmt.Errorf("Invalid toDate: %w", err)
	}

	step := time.Duration(input.Step) * time.Second

	return m.prometheusQuery(fromDate, toDate, step, input.VersionName, input.Namespace)

}

const refreshInterval = 5 * time.Second

// WatchVersionResourceMetrics call to Prometheus and return to channel the metrics for gRPC server
func (m *Manager) WatchVersionResourceMetrics(ctx context.Context, input *entity.InputVersionResourceMetrics, metricsCh chan<- []entity.VersionResourceMetrics) error {
	ticker := time.NewTicker(refreshInterval)

	fromDate, err := time.Parse(time.RFC3339, input.FromDate)
	if err != nil {
		return fmt.Errorf("Invalid fromDate: %w", err)
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
					m.logger.Errorf("error performing the Prometheus query: %w", err)
					return
				}

				fromDate = toDate
				metricsCh <- metrics
			}
		}
	}()

	return nil
}

// PrometheusQuery perform a call to Prometheus in order to get CPU and Memory values in a range of timeStamps
func (m *Manager) prometheusQuery(fromDate, toDate time.Time, step time.Duration, versionName, namespace string) ([]entity.VersionResourceMetrics, error) {

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
				  rate(container_cpu_usage_seconds_total{namespace='%s'}[5m])
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
				  rate(container_memory_usage_bytes{namespace='%s'}[5m])
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

	cpuValues := cpuResult.(model.Matrix)[0]
	memValues := memResult.(model.Matrix)[0]

	result := make([]entity.VersionResourceMetrics, len(cpuValues.Values))
	for i, v := range cpuValues.Values {
		result[i] = entity.VersionResourceMetrics{
			Date: v.Timestamp.Time(),
			CPU:  float64(v.Value),
			Mem:  float64(memValues.Values[i].Value),
		}
	}

	return result, nil

}
