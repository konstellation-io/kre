package config

import (
	"os"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v2"
)

// Config holds the configuration values for the application.
type Config struct {
	DevelopmentMode bool `yaml:"developmentMode" envconfig:"KRE_DEVELOPMENT_MODE"`

	EntrypointTLS bool `yaml:"entrypointTLS" envconfig:"KRE_ENTRYPOINT_TLS"`

	BaseDomainName string `yaml:"baseDomainName" envconfig:"KRE_BASE_DOMAIN_NAME"`

	SharedStorageClass string `yaml:"sharedStorageClass" envconfig:"KRE_SHARED_STORAGECLASS"`

	SharedStorageSize string `yaml:"sharedStorageSize" envconfig:"KRE_SHARED_STORAGE_SIZE"`

	Entrypoint struct {
		RequestTimeout string `yaml:"requestTimeout" envconfig:"KRE_ENTRYPOINT_REQUEST_TIMEOUT"`
	} `yaml:"entrypoint"`

	Server struct {
		Port string `yaml:"port" envconfig:"KRE_PORT"`
	} `yaml:"server"`

	Kubernetes struct {
		K8sRuntimeOperator struct {
			Version string `yaml:"version" envconfig:"KRE_KUBERNETES_OPERATOR_VERSION"`
		} `yaml:"k8sRuntimeOperator"`

		IsInsideCluster bool

		Namespace string `envconfig:"POD_NAMESPACE"`
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

	Chronograf struct {
		PersistentVolume struct {
			StorageClass string `yaml:"storageClass" envconfig:"KRE_CHRONOGRAF_STORAGECLASS"`
			Size         string `yaml:"size" envconfig:"KRE_CHRONOGRAF_STORAGE_SIZE"`
		} `yaml:"persistentVolume"`
	} `yaml:"chronograf"`

	InfluxDB struct {
		PersistentVolume struct {
			StorageClass string `yaml:"storageClass" envconfig:"KRE_INFLUXDB_STORAGECLASS"`
			Size         string `yaml:"size" envconfig:"KRE_INFLUXDB_STORAGE_SIZE"`
		} `yaml:"persistentVolume"`
	} `yaml:"influxdb"`
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

	if os.Getenv("KUBERNETES_PORT") != "" {
		cfg.Kubernetes.IsInsideCluster = true
	}

	err = envconfig.Process("", cfg)
	if err != nil {
		panic(err)
	}

	return cfg
}
