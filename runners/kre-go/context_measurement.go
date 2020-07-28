package kre

import (
	"github.com/influxdata/influxdb-client-go"
	"github.com/influxdata/influxdb-client-go/api"
	"github.com/konstellation-io/kre/libs/simplelogger"
	"github.com/konstellation-io/kre/runners/kre-go/config"
	"time"
)

type contextMeasurement struct {
	cfg      config.Config
	logger   *simplelogger.SimpleLogger
	writeAPI api.WriteAPI
}

func NewContextMeasurement(cfg config.Config, logger *simplelogger.SimpleLogger) *contextMeasurement {
	influxCli := influxdb2.NewClient(cfg.InfluxDB.URI, cfg.InfluxDB.Token)
	writeAPI := influxCli.WriteAPI(cfg.InfluxDB.Org, cfg.InfluxDB.Bucket)

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
