package usecase

import (
	"context"
	"fmt"
	"io/ioutil"
	"path"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

func (i *VersionInteractor) storeDashboards(ctx context.Context, runtime *entity.Runtime, dashboardsFolder, version string) []error {
	i.logger.Infof("Creating dashboard for Version %s in Runtime %s", version, runtime.Name)

	var errors []error = nil
	d, err := ioutil.ReadDir(dashboardsFolder)
	if err != nil {
		errors = append([]error{fmt.Errorf("error listing dashboards files: %w", err)}, errors...)
	}

	for _, dashboard := range d {
		dashboardPath := path.Join(dashboardsFolder, dashboard.Name())

		err = i.dashboardService.Create(ctx, runtime, version, dashboardPath)
		if err != nil {
			errors = append([]error{fmt.Errorf("error creating dashboard: %w", err)}, errors...)
			continue
		}

	}
	return errors
}
