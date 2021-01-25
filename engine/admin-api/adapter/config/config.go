package config

import (
	"os"
	"sync"
	"time"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v2"
)

// Config holds the configuration values for the application.
type Config struct {
	DevelopmentMode bool   `yaml:"developmentMode" envconfig:"KRE_DEVELOPMENT_MODE"`
	ReleaseName     string `yaml:"releaseName" envconfig:"KRE_RELEASE_NAME"`
	BaseDomainName  string `yaml:"baseDomainName" envconfig:"KRE_BASE_DOMAIN_NAME"`
	Application     struct {
		VersionStatusTimeout time.Duration `yaml:"versionStatusTimeout"`
	} `yaml:"application"`
	Admin struct {
		APIAddress      string `yaml:"apiAddress" envconfig:"KRE_ADMIN_API_ADDRESS"`
		BaseURL         string `yaml:"baseURL" envconfig:"KRE_ADMIN_API_BASE_URL"`
		FrontEndBaseURL string `yaml:"frontendBaseURL" envconfig:"KRE_ADMIN_FRONTEND_BASE_URL"`
		CORSEnabled     bool   `yaml:"corsEnabled" envconfig:"KRE_ADMIN_CORS_ENABLED"`
		StoragePath     string `yaml:"storagePath" envconfig:"KRE_ADMIN_STORAGE_PATH"`
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
		APITokenSecret                    string `yaml:"apiTokenSecret" envconfig:"KRE_AUTH_API_TOKEN_SECRET"`
		SecureCookie                      bool   `yaml:"secureCookie" envconfig:"KRE_AUTH_SECURE_COOKIE"`
		CookieDomain                      string `yaml:"cookieDomain" envconfig:"KRE_AUTH_COOKIE_DOMAIN"`
	} `yaml:"auth"`
	MongoDB struct {
		Address   string `yaml:"address" envconfig:"KRE_MONGODB_ADDRESS"`
		DBName    string `yaml:"dbName"`
		KRTBucket string `yaml:"krtBucket"`
	} `yaml:"mongodb"`
	K8s struct {
		Namespace string `yaml:"namespace" envconfig:"POD_NAMESPACE"`
	} `yaml:"k8s"`
	Services struct {
		K8sManager string `yaml:"k8sManager" envconfig:"KRE_SERVICES_K8S_MANAGER"`
	} `yaml:"services"`
	Runtime struct {
		Name string `yaml:"name" envconfig:"KRE_RUNTIME_NAME"`
	} `yaml:"runtime"`
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
