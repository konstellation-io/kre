package service

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	domainService "github.com/konstellation-io/kre/admin/admin-api/domain/service"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
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
	logger logging.Logger
	client http.Client
}

func CreateDashboardService(logger logging.Logger) domainService.DashboardService {

	client := http.Client{}
	return &Chronograf{logger, client}
}

func (c *Chronograf) Create(ctx context.Context, runtime *entity.Runtime, version string, data *os.File) error {

	c.logger.Infof("creating dashboard for runtime ")

	chronografURL := fmt.Sprintf("%s/chronograf/v1/dashboards", runtime.GetChronografURL())
	r, err := http.NewRequest(http.MethodPost, chronografURL, data)
	if err != nil {
		return fmt.Errorf("error creating Chronograf request: %w", err)
	}
	res, err := c.client.Do(r)
	if err != nil {
		return fmt.Errorf("error calling Chronograf: %w", err)
	}

	if res.StatusCode != http.StatusCreated {
		return fmt.Errorf("error response from Chronograf: %w", err)
	}
	return nil
}
