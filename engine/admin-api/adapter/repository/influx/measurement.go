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

func (m *MeasurementRepoInfluxDB) CreateDatabase(runtimeID string) error {
	createDatabaseCommand := fmt.Sprintf("CREATE DATABASE %q", runtimeID)
	query, err := m.generateQuery(createDatabaseCommand)

	if err != nil {
		return err
	}

	//nolint:gosec,bodyclose,noctx // The call is created with controlled parameters, it is not a user input.
	response, err := http.Post(query, "application/x-www-form-urlencoded", nil)
	if err != nil {
		return err
	}

	if response.StatusCode != http.StatusOK {
		//nolint:goerr113 // error needs to be dynamically generated
		return fmt.Errorf("influxdb database creation error: %d", response.StatusCode)
	}

	m.logger.Infof("influxdb database %q successfully created", runtimeID)

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
