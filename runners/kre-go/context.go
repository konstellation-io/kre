package kre

import (
	"path"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"github.com/nats-io/nats.go"

	"github.com/konstellation-io/kre/runners/kre-go/config"
	"github.com/konstellation-io/kre/runners/kre-go/mongodb"
)

var (
	saveMetricTimeout = 1 * time.Second
	saveDataTimeout   = 1 * time.Second
	getDataTimeout    = 1 * time.Second
)

type HandlerContext struct {
	cfg     config.Config
	values  map[string]interface{}
	Logger  *simplelogger.SimpleLogger
	Metrics *contextMetrics
	DB      *contextData
}

func NewHandlerContext(cfg config.Config, nc *nats.Conn, mongoM mongodb.Manager, logger *simplelogger.SimpleLogger) *HandlerContext {
	return &HandlerContext{
		cfg:    cfg,
		values: map[string]interface{}{},
		Logger: logger,
		Metrics: &contextMetrics{
			cfg:    cfg,
			nc:     nc,
			Logger: logger,
		},
		DB: &contextData{
			cfg:    cfg,
			nc:     nc,
			mongoM: mongoM,
			Logger: logger,
		},
	}
}

func (c *HandlerContext) Path(relativePath string) string {
	return path.Join(c.cfg.BasePath, relativePath)
}

func (c *HandlerContext) Set(key string, value interface{}) {
	c.values[key] = value
}

func (c *HandlerContext) Get(key string) interface{} {
	if val, ok := c.values[key]; ok {
		return val
	}
	c.Logger.Infof("Error getting value for key '%s' returning nil", key)
	return nil
}

func (c *HandlerContext) GetString(key string) string {
	v := c.Get(key)
	if val, ok := v.(string); ok {
		return val
	}
	c.Logger.Infof("Error getting value for key '%s' is not a string", key)
	return ""
}

func (c *HandlerContext) GetInt(key string) int {
	v := c.Get(key)
	if val, ok := v.(int); ok {
		return val
	}
	c.Logger.Infof("Error getting value for key '%s' is not a int", key)
	return -1
}

func (c *HandlerContext) GetFloat(key string) float64 {
	v := c.Get(key)
	if val, ok := v.(float64); ok {
		return val
	}
	c.Logger.Infof("Error getting value for key '%s' is not a float64", key)
	return -1.0
}
