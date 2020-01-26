package config

import (
	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v2"
	"os"
	"sync"
)

var once sync.Once
var cfg *Config

// Config holds the configuration values for the application
type Config struct {
	Nats struct {
		Server    string `yaml:"server" envconfig:"KRT_NATS_SERVER"`
		ClusterID string `yaml:"clusterId" envconfig:"KRT_NATS_CLUSTER_ID"`
	} `yaml:"nats"`

	MongoDB struct {
		Address string `yaml:"address" envconfig:"KRE_MONGODB_ADDRESS"`
		DBName  string `yaml:"dbName" envconfig:"KRE_MONGODB_DB_NAME"`
	} `yaml:"mongodb"`
}

// NewConfig will read the config.yml file and override values with env vars.
func NewConfig() *Config {
	once.Do(func() {
		f, err := os.Open("config.yml")
		if err != nil {
			panic(err)
		}

		cfg = &Config{}
		decoder := yaml.NewDecoder(f)
		err = decoder.Decode(cfg)
		if err != nil {
			panic(err)
		}

		err = envconfig.Process("", cfg)
		if err != nil {
			panic(err)
		}
	})

	return cfg
}
