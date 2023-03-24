package config

import (
	"github.com/kelseyhightower/envconfig"
)

// Config holds the configuration values for the application.
type Config struct {
	DevelopmentMode bool `yaml:"developmentMode" envconfig:"KRE_DEVELOPMENT_MODE"`

	Server struct {
		Port string `yaml:"port" envconfig:"KRE_NATS_MANAGER_PORT"`
	} `yaml:"server"`

	NatsStreaming struct {
		URL string `yaml:"url" envconfig:"KRE_NATS_URL"`
	} `yaml:"nats_streaming"`
}

// NewConfig will read the config.yml file and override values with env vars.
func NewConfig() *Config {
	var err error
	cfg := &Config{}

	err = envconfig.Process("", cfg)
	if err != nil {
		panic(err)
	}

	return cfg
}
