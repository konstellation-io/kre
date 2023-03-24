package config

import (
	"log"
	"os"
)

const APIURLKey = "INTEGRATION_TESTS_API_URL"
const APITokenKey = "INTEGRATION_TESTS_API_TOKEN"

// Config holds the configuration values for the application.
type Config struct {
	APIBaseURL string
	APIToken   string
}

// NewConfig will get the configuration values from env vars.
func NewConfig() Config {
	return Config{
		APIBaseURL: getStringFromEnvVar(APIURLKey),
		APIToken:   getStringFromEnvVar(APITokenKey),
	}
}

func getStringFromEnvVar(envVarKey string) string {
	v := os.Getenv(envVarKey)
	if v == "" {
		log.Fatalf("%q env var is not present", envVarKey)
	}

	return v
}
