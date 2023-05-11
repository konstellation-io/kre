package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"

	domainService "github.com/konstellation-io/kre/engine/admin-api/domain/service"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type Dashboard struct {
	Cells        []map[string]interface{} `json:"cells"`
	Templates    []map[string]interface{} `json:"templates"`
	Name         string                   `json:"name"`
	Organization string                   `json:"organization"`
	Links        struct {
		Self      string `json:"self"`
		Cells     string `json:"cells"`
		Templates string `json:"templates"`
	} `json:"links"`
}

type Chronograf struct {
	cfg    *config.Config
	logger logging.Logger
	client http.Client
}

func CreateDashboardService(cfg *config.Config, logger logging.Logger) domainService.DashboardService {
	client := http.Client{}

	return &Chronograf{cfg, logger, client}
}

func (c *Chronograf) Create(ctx context.Context, runtimeID, version, dashboardPath string) error {
	c.logger.Infof("Creating dashboard: %q for version: %q in runtime %q", dashboardPath, version, runtimeID)

	data, err := os.Open(dashboardPath)
	if err != nil {
		return fmt.Errorf("error opening dashboard definition: %w", err)
	}
	defer data.Close()

	byteData, err := io.ReadAll(data)
	if err != nil {
		return fmt.Errorf("error reading Chronograf dashboard definition: %w", err)
	}

	var dashboard Dashboard
	err = json.Unmarshal(byteData, &dashboard)

	if err != nil {
		return fmt.Errorf("error unmarshalling Chronograf dashboard definition: %w", err)
	}

	dashboard.Name = fmt.Sprintf("%s-%s-%s", runtimeID, version, dashboard.Name)
	requestByte, err := json.Marshal(dashboard)

	if err != nil {
		return fmt.Errorf("error marshaling Chronograf dashboard definition: %w", err)
	}

	requestReader := bytes.NewReader(requestByte)

	chronografURL := fmt.Sprintf("%s/measurements/%s/chronograf/v1/dashboards",
		c.cfg.Chronograf.Address, c.cfg.K8s.Namespace)

	r, err := http.NewRequestWithContext(ctx, http.MethodPost, chronografURL, requestReader)

	if err != nil {
		return fmt.Errorf("error creating Chronograf request: %w", err)
	}

	//nolint:bodyclose // legacy code
	res, err := c.client.Do(r)

	if err != nil {
		return fmt.Errorf("error calling Chronograf: %w", err)
	}

	if res.StatusCode != http.StatusCreated {
		//nolint:goerr113 // error needs to be dynamic
		return fmt.Errorf("error response from Chronograf: received %d when expected %d", res.StatusCode, http.StatusCreated)
	}

	return nil
}
