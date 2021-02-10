package graphql

import (
	"fmt"
	"time"

	"gitlab.com/konstellation/konstellation-ce/kre/acceptance-tests/entity"
)

const publishingWaitingTime = 4 * time.Second

const versionPublish = `
  mutation PublishVersion($input: PublishVersionInput!) {
    publishVersion(input: $input) {
			status
    }
	}
`

const versionUnpublish = `
  mutation UnpublishVersion($input: UnpublishVersionInput!) {
    unpublishVersion(input: $input) {
			status
    }
	}
`

type versionPublishResponse struct {
	PublishVersion struct {
		Status string
	}
}

type versionUnpublishResponse struct {
	UnpublishVersion struct {
		Status string
	}
}

func (g GQManager) VersionPublish(versionName, comment string) error {
	respData := versionPublishResponse{}

	err := g.versionPublishing(versionPublish, &respData, versionName, comment)
	if err != nil {
		return err
	}

	status := respData.PublishVersion.Status
	if status != entity.VersionStatusPublished {
		// nolint:goerr113
		return fmt.Errorf("error publishing the version status is %s and should be %s",
			status, entity.VersionStatusPublished)
	}

	return nil
}

func (g GQManager) VersionUnpublish(versionName, comment string) error {
	respData := versionUnpublishResponse{}

	err := g.versionPublishing(versionUnpublish, &respData, versionName, comment)
	if err != nil {
		return err
	}

	status := respData.UnpublishVersion.Status
	if status != entity.VersionStatusStarted {
		// nolint:goerr113
		return fmt.Errorf("error publishing the version status is %s and should be %s",
			status, entity.VersionStatusStarted)
	}

	return nil
}

func (g GQManager) versionPublishing(query string, respData interface{}, versionName, comment string) error {
	vars := map[string]interface{}{
		"input": map[string]string{"versionName": versionName, "comment": comment},
	}

	err := g.makeRequest(query, &respData, vars)
	if err != nil {
		return err
	}

	// Sometimes if we publish or unpublish a version quickly, the version status is inconsistent.
	time.Sleep(publishingWaitingTime)

	return nil
}
