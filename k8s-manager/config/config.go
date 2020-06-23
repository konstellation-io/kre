package config

import (
	"os"
	"sync"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v2"
)

//nolint:gochecknoglobals
var (
	once sync.Once
	cfg  *Config
)

// Config holds the configuration values for the application.
type Config struct {
	DevelopmentMode bool `yaml:"developmentMode" envconfig:"KRE_DEVELOPMENT_MODE"`

	BaseDomainName string `yaml:"baseDomainName" envconfig:"KRE_BASE_DOMAIN_NAME"`

	SharedStorageClass string `yaml:"sharedStorageClass" envconfig:"KRE_SHARED_STORAGECLASS"`

	SharedStorageSize string `yaml:"sharedStorageSize" envconfig:"KRE_SHARED_STORAGE_SIZE"`

	Server struct {
		Port string `yaml:"port" envconfig:"KRE_PORT"`
	} `yaml:"server"`

	Kubernetes struct {
		Operator struct {
			Version string `yaml:"version" envconfig:"KRE_KUBERNETES_OPERATOR_VERSION"`
		} `yaml:"operator"`

		IsInsideCluster bool
	} `yaml:"kubernetes"`

	Prometheus struct {
		URL string `yaml:"url" envconfig:"KRE_PROMETHEUS_URL"`
	} `yaml:"prometheus"`

	NatsStreaming struct {
		Storage struct {
			ClassName string `yaml:"className" envconfig:"KRE_NATS_STORAGECLASS"`
			Size      string `yaml:"size" envconfig:"KRE_NATS_STORAGE_SIZE"`
		} `yaml:"storage"`
	} `yaml:"nats_streaming"`

	MongoDB struct {
		PersistentVolume struct {
			StorageClass string `yaml:"storageClass" envconfig:"KRE_MONGODB_STORAGECLASS"`
			Size         string `yaml:"size" envconfig:"KRE_MONGODB_STORAGE_SIZE"`
		} `yaml:"persistentVolume"`
	} `yaml:"mongo"`
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

		if os.Getenv("KUBERNETES_PORT") != "" {
			cfg.Kubernetes.IsInsideCluster = true
		}

		err = envconfig.Process("", cfg)
		if err != nil {
			panic(err)
		}
	})

	return cfg
}
