package kre

import (
	"github.com/influxdata/influxdb-client-go"
	"github.com/influxdata/influxdb-client-go/api"
	"github.com/konstellation-io/kre/libs/simplelogger"
	"github.com/konstellation-io/kre/runners/kre-go/config"
	"time"
)

// We are using influxdb-client-go that is compatible with 1.8+ versions:
// https://github.com/influxdata/influxdb-client-go#influxdb-18-api-compatibility
//   - Use the form username:password for an authentication token.
//   - The organization parameter is not used. Use an empty string ("") where necessary.
//   - Use the form database/retention-policy where a bucket is required. Skip retention policy if the default retention policy should be used.
const (
	org    = ""    // not used
	bucket = "kre" // kre is the created database during the deployment
	token  = ""    // we don't need authentication
)

type contextMeasurement struct {
	cfg      config.Config
	logger   *simplelogger.SimpleLogger
	writeAPI api.WriteAPI
}

func NewContextMeasurement(cfg config.Config, logger *simplelogger.SimpleLogger) *contextMeasurement {
	influxCli := influxdb2.NewClient(cfg.InfluxDB.URI, token)
	writeAPI := influxCli.WriteAPI(org, bucket)

	return &contextMeasurement{
		cfg,
		logger,
		writeAPI,
	}
}

func (c *contextMeasurement) Save(measurement string, fields map[string]interface{}, tags map[string]string) {
	p := influxdb2.NewPointWithMeasurement(measurement)

	for f, v := range fields {
		p.AddField(f, v)
	}

	for t, v := range tags {
		p.AddTag(t, v)
	}

	p.SetTime(time.Now())

	c.writeAPI.WritePoint(p)
	c.writeAPI.Flush()
}
