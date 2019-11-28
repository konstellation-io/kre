package config

import (
	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v2"
	"os"
	"sync"
)

// Config holds the configuration values for the application.
type Config struct {
	Admin struct {
		APIAddress      string `yaml:"apiAddress" envconfig:"KRE_ADMIN_API_ADDRESS"`
		FrontEndBaseURL string `yaml:"frontendBaseURL" envconfig:"KRE_ADMIN_FRONTEND_BASE_URL"`
		CORSEnabled     bool   `yaml:"corsEnabled" envconfig:"KRE_ADMIN_CORS_ENABLED"`
	} `yaml:"admin"`
	SMTP struct {
		Enabled    bool   `yaml:"enabled" envconfig:"KRE_SMTP_ENABLED"`
		Sender     string `yaml:"sender" envconfig:"KRE_SMTP_SENDER"`
		SenderName string `yaml:"senderName" envconfig:"KRE_SMTP_SENDER_NAME"`
		User       string `yaml:"user" envconfig:"KRE_SMTP_USER"`
		Pass       string `yaml:"pass" envconfig:"KRE_SMTP_PASS"`
		Host       string `yaml:"host" envconfig:"KRE_SMTP_HOST"`
		Port       int    `yaml:"port" envconfig:"KRE_SMTP_PORT"`
	} `yaml:"smtp"`
	Auth struct {
		VerificationCodeDurationInMinutes int    `yaml:"verificationCodeDurationInMinutes" envconfig:"KRE_AUTH_VERIFICATION_CODE_DURATION_IN_MINUTES"`
		JWTSignSecret                     string `yaml:"jwtSignSecret" envconfig:"KRE_AUTH_JWT_SIGN_SECRET"`
		SecureCookie                      bool   `yaml:"secureCookie" envconfig:"KRE_AUTH_SECURE_COOKIE"`
	} `yaml:"auth"`
	MongoDB struct {
		Address string `yaml:"address" envconfig:"KRE_MONGODB_ADDRESS"`
		DBName  string `yaml:"dbName" envconfig:"KRE_MONGODB_DB_NAME"`
	} `yaml:"mongodb"`
	Services struct {
		K8sManager string `yaml:"k8sManager" envconfig:"KRE_SERVICES_K8S_MANAGER"`
	} `yaml:"services"`
}

var once sync.Once
var cfg *Config

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
