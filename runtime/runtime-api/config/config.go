package config

import (
	"fmt"
	"os"
	"sync"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v2"
)

var once sync.Once
var cfg *Config

// Config holds the configuration values for the application
type Config struct {
	Server struct {
		Port string `yaml:"port" envconfig:"KRE_RUNTIME_API_SERVER_PORT"`
	} `yaml:"server"`

	MongoDB struct {
		Address string `yaml:"address" envconfig:"KRE_RUNTIME_MONGO_URI"`
		DBName  string `yaml:"dbName" envconfig:"KRE_MONGODB_DB_NAME"`
	} `yaml:"mongodb"`

	Kubernetes struct {
		Namespace       string `envconfig:"POD_NAMESPACE"`
		IsInsideCluster bool
	} `yaml:"kubernetes"`
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

		if os.Getenv("KUBERNETES_PORT") != "" {
			cfg.Kubernetes.IsInsideCluster = true
		}

		fmt.Printf("Namespace: %s\n", cfg.Kubernetes.Namespace)

	})

	return cfg
}
