package graphql

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const signInTimeout = 30 * time.Second

type tokenSignInRes struct {
	AccessToken string `json:"access_token"`
}

func (g *GQManager) SignIn() error {
	data := url.Values{}
	data.Add("apiToken", g.cfg.APIToken)

	signInURL, err := getAPIURL(g.cfg.APIBaseURL, "/api/v1/auth/token/signin")

	if err != nil {
		return err
	}

	log.Printf("Getting valid access token from %s...", signInURL)

	ctx, cancel := context.WithTimeout(context.Background(), signInTimeout)
	defer cancel()

	r, err := http.NewRequestWithContext(ctx, http.MethodPost, signInURL, strings.NewReader(data.Encode()))
	if err != nil {
		return fmt.Errorf("unexpected creating req to get access token: %w", err)
	}

	r.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	r.Header.Add("Content-Length", strconv.Itoa(len(data.Encode())))

	client := &http.Client{}

	resp, err := client.Do(r)
	if err != nil {
		return fmt.Errorf("unexpected error getting access token: %w", err)
	}
	defer resp.Body.Close()

	res := tokenSignInRes{}

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return fmt.Errorf("unexpected error decoding response: %w", err)
	}

	log.Print("New access token loaded")

	g.accessToken = res.AccessToken

	return nil
}
