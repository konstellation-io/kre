package graphql

const querySessionLifettime = `
	{
		settings {
			sessionLifetimeInDays
		}
	}
`

type sessionLifetimeResponse struct {
	Settings struct {
		SessionLifetimeInDays int
	}
}

func (g GQManager) SessionLifetime() (int, error) {
	var respData sessionLifetimeResponse

	err := g.makeRequest(querySessionLifettime, &respData, nil)
	if err != nil {
		return 0, err
	}

	return respData.Settings.SessionLifetimeInDays, nil
}
