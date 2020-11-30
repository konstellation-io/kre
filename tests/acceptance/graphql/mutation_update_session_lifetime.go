package graphql

const updateSessionLifetime = `
	mutation UpdateSettings($input: SettingsInput!) {
		updateSettings(input: $input) {
			sessionLifetimeInDays
		}
	}
`

type updateSessionLifetimeResponse struct {
	UpdateSettings struct {
		SessionLifetimeInDays int
	}
}

func (g *GQManager) UpdateSessionLifetime(newValue int) (int, error) {
	respData := updateSessionLifetimeResponse{}

	vars := map[string]interface{}{
		"input": map[string]int{"sessionLifetimeInDays": newValue},
	}

	err := g.makeRequest(updateSessionLifetime, &respData, vars)
	if err != nil {
		return -1, err
	}

	return respData.UpdateSettings.SessionLifetimeInDays, nil
}
