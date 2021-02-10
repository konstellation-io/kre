package graphql

import (
	"context"
	"errors"
	"log"
	"net/url"
	"path"
	"time"

	"github.com/machinebox/graphql"
	"gitlab.com/konstellation/konstellation-ce/kre/acceptance-tests/config"
)

const DefaultOpTimeout = 60 * time.Second

var ErrMissingAccessToken = errors.New("missing access-token, call to SigIn first")

type GQManager struct {
	cfg         config.Config
	client      *graphql.Client
	accessToken string
}

func getAPIURL(baseURL, pathURL string) (string, error) {
	u, err := url.Parse(baseURL)

	if err != nil {
		return "", err
	}

	u.Path = path.Join(u.Path, pathURL)
	fullURL := u.String()

	return fullURL, nil
}

func NewGQManager(cfg config.Config) (*GQManager, error) {
	graphQLURL, err := getAPIURL(cfg.APIBaseURL, "/graphql")

	if err != nil {
		return nil, err
	}

	c := graphql.NewClient(graphQLURL)
	c.Log = func(s string) { log.Println(s) }

	return &GQManager{
		cfg:    cfg,
		client: c,
	}, nil
}

func (g GQManager) makeRequest(query string, respData interface{}, vars map[string]interface{}) error {
	if g.accessToken == "" {
		return ErrMissingAccessToken
	}

	req := graphql.NewRequest(query)
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Authorization", "Bearer "+g.accessToken)

	for k, v := range vars {
		req.Var(k, v)
	}

	ctx, cancel := context.WithTimeout(context.Background(), DefaultOpTimeout)
	defer cancel()

	return g.client.Run(ctx, req, respData)
}
