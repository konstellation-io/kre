package influx

import (
	"fmt"
	"net/http"
	"net/url"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

const queryEndpoint = "/query"

type MeasurementRepoInfluxDB struct {
	cfg    *config.Config
	logger logging.Logger
}

func NewMeasurementRepoInfluxDB(cfg *config.Config, logger logging.Logger) *MeasurementRepoInfluxDB {
	return &MeasurementRepoInfluxDB{
		cfg,
		logger,
	}
}

func (m *MeasurementRepoInfluxDB) CreateDatabase(runtimeId string) error {
	createDatabaseCommand := fmt.Sprintf("CREATE DATABASE %q", runtimeId)
	query, err := m.generateQuery(createDatabaseCommand)
	if err != nil {
		return err
	}

	response, err := http.Post(query, "application/x-www-form-urlencoded", nil)
	if err != nil {
		return err
	}

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("influxdb database creation status: %d", response.StatusCode)
	}

	m.logger.Infof("influxdb database %q successfully created", runtimeId)
	return nil
}

func (m *MeasurementRepoInfluxDB) generateQuery(influxCommand string) (string, error) {
	urlWithQuery, err := url.Parse(m.cfg.InfluxDB.Address + queryEndpoint)
	if err != nil {
		return "", err
	}

	queryParams := url.Values{}
	queryParams.Add("q", influxCommand)

	urlWithQuery.RawQuery = queryParams.Encode()

	return urlWithQuery.String(), nil
}
