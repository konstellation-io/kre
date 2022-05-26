package usecase

import (
	"context"
	"fmt"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"io/ioutil"
	"path"
)

func (i *VersionInteractor) storeDashboards(ctx context.Context, dashboardsFolder string, runtime *entity.Runtime, version string) []error {
	i.logger.Infof("Storing dashboards for version \"%s\" in runtime \"%s\"", version, runtime.Name)

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
