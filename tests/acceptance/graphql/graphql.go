package graphql

import (
	"context"
	"errors"
	"fmt"
	"log"
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

func NewGQManager(cfg config.Config) *GQManager {
	graphQLURL := fmt.Sprintf("%s/graphql", cfg.APIBaseURL)
	c := graphql.NewClient(graphQLURL)
	c.Log = func(s string) { log.Println(s) }

	return &GQManager{
		cfg:    cfg,
		client: c,
	}
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
