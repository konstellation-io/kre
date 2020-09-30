package usecase

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
)

func (i *VersionInteractor) storeDashboards(runtime *entity.Runtime, dashboardsFolder string) error {

	i.logger.Infof("---- Creating dashboard ")

	d, err := ioutil.ReadDir(dashboardsFolder)
	if err != nil {
		return fmt.Errorf("error listing dashboards files on %s: %w ", dashboardsFolder, err)
	}

	client := http.Client{}

	for _, dashboard := range d {
		dashboardPath := path.Join(dashboardsFolder, dashboard.Name())
		data, err := os.Open(dashboardPath)
		if err != nil {
			return err
		}
		chronografURL := fmt.Sprintf("%s/measurements/kre-%s/chronograf/v1/dashboards", runtime.GetChronografURL(), runtime.Name)
		fmt.Printf("------------------ Chronograf URL: %s", chronografURL)
		r, err := http.NewRequest(http.MethodPost, chronografURL, data)
		if err != nil {
			return err
		}
		res, err := client.Do(r)
		if err != nil {
			return fmt.Errorf("error calling Chronograf: %w", err)
		}

		if res.StatusCode != http.StatusCreated {
			return fmt.Errorf("error calling Chronograf: %d", res.StatusCode)
		}

	}
	return nil
}
