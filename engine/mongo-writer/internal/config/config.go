package config

import (
	"os"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v2"
)

// Config holds the configuration values for the application.
type Config struct {
	LogLevel string `yaml:"logLevel" envconfig:"MONGO_WRITER_LOG_LEVEL"`
	Nats     struct {
		Server              string `yaml:"server" envconfig:"KRT_NATS_SERVER"`
		LogsSubjectWildcard string `default:"mongo_writer_logs.*"`
		DataSubjectWildcard string `default:"mongo_writer_data.*"`
	} `yaml:"nats"`
	MongoDB struct {
		Address     string `yaml:"address" envconfig:"KRE_RUNTIME_MONGO_URI"`
		LogsDBName  string `yaml:"logsDbName"`
		DataDBName  string `yaml:"dataDbName"`
		ConnTimeout int    `yaml:"connTimeout" envconfig:"KRE_MONGODB_CONN_TIMEOUT"`
	} `yaml:"mongodb"`
}

// NewConfig will read the config.yml file and override values with env vars.
func NewConfig() *Config {
	f, err := os.Open("config.yml")
	if err != nil {
		panic(err)
	}

	cfg := &Config{}
	decoder := yaml.NewDecoder(f)

	err = decoder.Decode(cfg)
	if err != nil {
		panic(err)
	}

	err = envconfig.Process("", cfg)
	if err != nil {
		panic(err)
	}

	return cfg
}
