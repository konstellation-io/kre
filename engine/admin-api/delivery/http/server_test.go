package http_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	httpapp "github.com/konstellation-io/kre/engine/admin-api/delivery/http"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
	"github.com/stretchr/testify/require"
)

func TestServerCall(t *testing.T) {
	cfg := &config.Config{}
	cfg.Admin.APIAddress = ":4000"
	ctrl := gomock.NewController(t)
	logger := mocks.NewMockLogger(ctrl)
	mocks.AddLoggerExpects(logger)

	gqlController := mocks.NewMockGraphQL(ctrl)

	app := httpapp.NewApp(
		cfg,
		logger,
		gqlController,
	)

	go app.Start()

	// time.Sleep(1 * time.Second)

	url := fmt.Sprintf("http://localhost%s", cfg.Admin.APIAddress)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	require.NoError(t, err)

	req.Header.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9kdWN0X3JvbGVzIjp7InRlc3QtcHJvZHVjdCI6WyJBRE1JTiJdfSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIlZJRVdFUiJdfX0.JV986y0wYla4tAY3T6h1MKVfzQPVcBhOyK_F_G5fGQI")

	res, err := http.DefaultClient.Do(req)
	fmt.Println(res)
	fmt.Println(res)

	require.NoError(t, err)

	require.Equal(t, res.StatusCode, http.StatusOK)
}
