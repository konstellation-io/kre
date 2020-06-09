package resourcemetrics

import (
	"context"
	"fmt"
	"time"

	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"gitlab.com/konstellation/kre/k8s-manager/config"
	"gitlab.com/konstellation/kre/k8s-manager/entity"
	"gitlab.com/konstellation/kre/libs/simplelogger"
)

// Manager contains methods to call Prometheus
type Manager struct {
	config *config.Config
	logger *simplelogger.SimpleLogger
}

// New returns an instance of the Prometheus manager
func New(config *config.Config, logger *simplelogger.SimpleLogger) *Manager {

	return &Manager{
		config,
		logger,
	}
}

// GetVersionResourceMetrics get from Prometheus the resource usage for a specific version
func (m *Manager) GetVersionResourceMetrics(input *entity.InputVersionResourceMetrics) ([]entity.VersionResourceMetrics, error) {
	client, err := api.NewClient(api.Config{
		Address: m.config.Prometheus.Url,
	})
	if err != nil {
		m.logger.Errorf("Error creating client: %v\n", err.Error())
		return nil, err
	}
	fromDate, err := time.Parse(time.RFC3339, input.FromDate)
	if err != nil {
		m.logger.Errorf("Bad date format: %v", err)
	}

	toDate, err := time.Parse(time.RFC3339, input.ToDate)
	if err != nil {
		m.logger.Errorf("Bad date format: %v", err)
	}

	step := time.Duration(input.Step) * time.Second

	v1api := v1.NewAPI(client)
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
	 ) by (label_version_name)`, input.VersionName, input.Namespace)

	cpuResult, warnings, err := v1api.QueryRange(ctx, cpuQuery, r)
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
	 ) by (label_version_name)`, input.VersionName, input.Namespace)

	memResult, warnings, err := v1api.QueryRange(ctx, memQuery, r)
	if err != nil {
		m.logger.Errorf("Error querying Prometheus: %v\n", err.Error())
		return nil, err
	}
	if len(warnings) > 0 {
		m.logger.Infof("Warnings: %v\n", warnings)
	}

	fmt.Println(cpuResult)
	fmt.Println(memResult)

	return nil, nil

}
