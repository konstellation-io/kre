package usecase

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
)

func (i *VersionInteractor) storeDashboards(runtime *entity.Runtime, dashboardsFolder string) []error {

	i.logger.Infof("---- Creating dashboard ")

	var errors []error = nil
	d, err := ioutil.ReadDir(dashboardsFolder)
	if err != nil {
		errors = append([]error{fmt.Errorf("error listing dashboards files: %w", err)}, errors...)
	}

	for _, dashboard := range d {
		dashboardPath := path.Join(dashboardsFolder, dashboard.Name())
		data, err := os.Open(dashboardPath)
		if err != nil {
			errors = append([]error{fmt.Errorf("error listing dashboards files: %w", err)}, errors...)
			continue
		}

		// i.dashboardService.Create(ctx context.Context, runtime *entity.Runtime, version string)

	}
	return errors
}
