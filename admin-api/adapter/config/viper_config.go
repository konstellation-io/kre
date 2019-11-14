package config

import (
	"fmt"
	"strings"
	"sync"

	"github.com/spf13/viper"
)

// Config holds the configuration values for the application.
type Config struct {
	Server serverConfig `mapstructure:"server"`
	SMTP   smtpConfig   `mapstructure:"smtp"`
	Auth   authConfig   `mapstructure:"auth"`
}

type serverConfig struct {
	Address         string `mapstructure:"address"`
	FrontEndBaseURL string `mapstructure:"frontend_base_url"`
}

type smtpConfig struct {
	Enabled    bool   `mapstructure:"enabled"`
	Sender     string `mapstructure:"sender"`
	SenderName string `mapstructure:"sender_name"`
	User       string `mapstructure:"user"`
	Pass       string `mapstructure:"pass"`
	Host       string `mapstructure:"host"`
	Port       int    `mapstructure:"port"`
}

type authConfig struct {
	TokenDurationInHours int `mapstructure:"token_duration_in_hours"`
}

var once sync.Once
var cfg *Config

// NewConfig will read the config.yml file and override values with env vars.
func NewConfig() *Config {
	once.Do(func() {
		viper.SetConfigName("config")
		viper.SetConfigType("yml")
		viper.AddConfigPath("./")

		err := viper.ReadInConfig()
		if err != nil {
			panic(fmt.Errorf("fatal error config file: %s", err))
		}
		viper.AutomaticEnv()
		viper.SetEnvPrefix("KRT")
		viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

		cfg = &Config{}
		if err := viper.Unmarshal(&cfg); err != nil {
			panic(err)
		}
	})

	return cfg
}
