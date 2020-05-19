package kre

import (
	"log"
	"os"
)

type Config struct {
	Version  string
	NodeName string
	BasePath string
	NATS     ConfigNATS
}

type ConfigNATS struct {
	Server             string
	InputSubject       string
	OutputSubject      string
	MongoWriterSubject string
}

func NewConfig() Config {
	return Config{
		Version:  getCfgFromEnv("KRT_VERSION"),
		NodeName: getCfgFromEnv("KRT_NODE_NAME"),
		BasePath: getCfgFromEnv("KRT_BASE_PATH"),
		NATS: ConfigNATS{
			Server:             getCfgFromEnv("KRT_NATS_SERVER"),
			InputSubject:       getCfgFromEnv("KRT_NATS_INPUT"),
			OutputSubject:      getCfgFromEnv("KRT_NATS_OUTPUT"),
			MongoWriterSubject: getCfgFromEnv("KRT_NATS_MONGO_WRITER"),
		},
	}
}

func getCfgFromEnv(name string) string {
	val, ok := os.LookupEnv(name)
	if !ok {
		log.Fatalf("Error reading config: the '%s' env var is missing", name)
	}
	return val
}
