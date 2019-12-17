package config

import (
	"log"
	"os"
	"strings"
	"sync"

	"github.com/spf13/viper"
)

var once sync.Once
var config *Config

// Config holds the configuration values for the application
type Config struct {
	BaseDomainName string `mapstructure:"baseDomainName"`

	Server struct {
		Port string `mapstructure:"port"`
	} `mapstructure:"server"`

	Kubernetes struct {
		Operator struct {
			Version string `mapstructure:"version"`
		} `mapstructure:"operator"`

		IsInsideCluster bool
	} `mapstructure:"kubernetes"`
}

// NewConfig will read the config.yml file and override values with env vars
func NewConfig() *Config {
	once.Do(func() {
		config = loadConfig()
	})

	return config
}

func loadConfig() *Config {
	viper.SetConfigName("config")
	viper.SetConfigType("yml")
	viper.AddConfigPath("./")
	err := viper.ReadInConfig()
	if err != nil {
		log.Fatalf("Fatal error config file: %s", err)
	}
	viper.AutomaticEnv()
	viper.SetEnvPrefix("KRE")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	if os.Getenv("KUBERNETES_PORT") != "" {
		viper.Set("Kubernetes.IsInsideCluster", true)
	}

	config := &Config{}
	viper.Unmarshal(&config)

	return config
}
