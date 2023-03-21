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

	ReleaseName string `yaml:"releaseName" envconfig:"KRE_RELEASE_NAME"`

	Entrypoint struct {
		RequestTimeout           string `yaml:"requestTimeout" envconfig:"KRE_ENTRYPOINTS_REQUEST_TIMEOUT"`
		IngressClassName         string `yaml:"ingressClassName" envconfig:"KRE_ENTRYPOINTS_INGRESS_CLASS_NAME"`
		IngressAnnotationsBase64 string `yaml:"ingressAnnotationsBase64" envconfig:"KRE_ENTRYPOINTS_BASE64_INGRESSES_ANNOTATIONS"`
		TLS                      struct {
			IsEnabled      bool   `yaml:"isEnabled" envconfig:"KRE_ENTRYPOINTS_TLS"`
			CertSecretName string `yaml:"secretName" envconfig:"KRE_ENTRYPOINTS_TLS_CERT_SECRET_NAME"`
		} `yaml:"tls"`
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

	NatsStreaming struct {
		URL  string `yaml:"url" envconfig:"KRE_NATS_URL"`
		Host string `yaml:"host" envconfig:"KRE_NATS_HOST"`
		Port string `yaml:"port" envconfig:"KRE_NATS_PORT"`
	} `yaml:"nats_streaming"`

	KrtFilesDownloader struct {
		Image      string `yaml:"image" envconfig:"KRE_KRT_FILES_DOWNLOADER_IMAGE"`
		Tag        string `yaml:"tag" envconfig:"KRE_KRT_FILES_DOWNLOADER_TAG"`
		PullPolicy string `yaml:"pullPolicy" envconfig:"KRE_KRT_FILES_DOWNLOADER_PULL_POLICY"`
	} `yaml:"krtFilesDownloader"`
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
