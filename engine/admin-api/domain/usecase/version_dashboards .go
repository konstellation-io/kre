package usecase

import (
	"context"
	"fmt"
	"io/ioutil"
	"path"
)

func (i *VersionInteractor) storeDashboards(ctx context.Context, dashboardsFolder, version string) []error {
	i.logger.Infof("Storing dashboards for version \"%s\"", version)

	var errors []error = nil
	d, err := ioutil.ReadDir(dashboardsFolder)
	if err != nil {
		errors = append([]error{fmt.Errorf("error listing dashboards files: %w", err)}, errors...)
	}

	for _, dashboard := range d {
		dashboardPath := path.Join(dashboardsFolder, dashboard.Name())

		err = i.dashboardService.Create(ctx, version, dashboardPath)
		if err != nil {
			errors = append([]error{fmt.Errorf("error creating dashboard: %w", err)}, errors...)
			continue
		}

	}
	return errors
}
