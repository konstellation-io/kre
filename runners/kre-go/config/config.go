package config

import (
	"os"

	"github.com/konstellation-io/kre/libs/simplelogger"
)

type Config struct {
	VersionID string
	Version   string
	NodeName  string
	BasePath  string
	NATS      ConfigNATS
	MongoDB   MongoDB
	InfluxDB  InfluxDB
}

type MongoDB struct {
	Address     string
	DBName      string
	ConnTimeout int
}

type ConfigNATS struct {
	Server             string
	InputSubject       string
	OutputSubject      string
	MongoWriterSubject string
}

type InfluxDB struct {
	URI string
}

func NewConfig(logger *simplelogger.SimpleLogger) Config {
	return Config{
		VersionID: getCfgFromEnv(logger, "KRT_VERSION_ID"),
		Version:   getCfgFromEnv(logger, "KRT_VERSION"),
		NodeName:  getCfgFromEnv(logger, "KRT_NODE_NAME"),
		BasePath:  getCfgFromEnv(logger, "KRT_BASE_PATH"),
		NATS: ConfigNATS{
			Server:             getCfgFromEnv(logger, "KRT_NATS_SERVER"),
			InputSubject:       getCfgFromEnv(logger, "KRT_NATS_INPUT"),
			OutputSubject:      getCfgFromEnv(logger, "KRT_NATS_OUTPUT"),
			MongoWriterSubject: getCfgFromEnv(logger, "KRT_NATS_MONGO_WRITER"),
		},
		MongoDB: MongoDB{
			Address:     getCfgFromEnv(logger, "KRT_MONGO_URI"),
			DBName:      getCfgFromEnv(logger, "KRT_MONGO_DB_NAME"),
			ConnTimeout: 120,
		},
		InfluxDB: InfluxDB{
			URI: getCfgFromEnv(logger, "KRT_INFLUX_URI"),
		},
	}
}

func getCfgFromEnv(logger *simplelogger.SimpleLogger, name string) string {
	val, ok := os.LookupEnv(name)
	if !ok {
		logger.Errorf("Error reading config: the '%s' env var is missing", name)
		os.Exit(1)
	}
	return val
}
