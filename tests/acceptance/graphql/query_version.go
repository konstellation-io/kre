package graphql

const queryVersion = `
	query FetchVersion($id: ID!) {
		version(id: $id) {
			id
			status
		}
	}
`

type VersionResponse struct {
	Version struct {
		ID     string
		Status string
	}
}

func (g GQManager) GetVersionStatus(versionID string) (string, error) {
	var respData VersionResponse

	vars := map[string]interface{}{
		"id": versionID,
	}

	err := g.makeRequest(queryVersion, &respData, vars)
	if err != nil {
		return "", err
	}

	return respData.Version.Status, nil
}
