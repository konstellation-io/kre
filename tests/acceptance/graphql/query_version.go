package graphql

const queryVersion = `
	query FetchVersion($name: String!) {
		version(name: $name) {
			name
			status
		}
	}
`

type VersionResponse struct {
	Version struct {
		Name   string
		Status string
	}
}

func (g GQManager) GetVersionStatus(versionName string) (string, error) {
	var respData VersionResponse

	vars := map[string]interface{}{
		"name": versionName,
	}

	err := g.makeRequest(queryVersion, &respData, vars)
	if err != nil {
		return "", err
	}

	return respData.Version.Status, nil
}
