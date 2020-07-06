package kre

import (
	"context"
	"encoding/json"
	"fmt"
	"path"
	"time"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"github.com/nats-io/nats.go"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/konstellation-io/kre/runners/kre-go/config"
	"github.com/konstellation-io/kre/runners/kre-go/mongodb"
)

type SaveMetricErr string

var (
	saveMetricTimeout = 1 * time.Second
	saveDataTimeout   = 1 * time.Second
	getDataTimeout    = 1 * time.Second
)

const (
	classificationMetricsColl               = "classificationMetrics"
	ErrMissingValues          SaveMetricErr = "missing_values"
	ErrNewLabels              SaveMetricErr = "new_labels"
)

func (s SaveMetricErr) IsValid() error {
	switch s {
	case ErrMissingValues, ErrNewLabels:
		return nil
	}
	return fmt.Errorf("invalid SaveMetricErr type: %s", s)
}

type SaveMetricMsg struct {
	Coll string           `json:"coll"`
	Doc  SaveMetricMsgDoc `json:"doc"`
}

type SaveMetricMsgDoc struct {
	Date           string `json:"date"`
	Error          string `json:"error"`
	PredictedValue string `json:"predictedValue"`
	TrueValue      string `json:"trueValue"`
	VersionID      string `json:"versionId"`
	VersionName    string `json:"versionName"`
}

type SaveDataMsg struct {
	Coll string      `json:"coll"`
	Doc  interface{} `json:"doc"`
}

type HandlerContext struct {
	cfg    config.Config
	nc     *nats.Conn
	mongoM mongodb.Manager
	values map[string]interface{}
	Logger *simplelogger.SimpleLogger
}

func NewHandlerContext(cfg config.Config, nc *nats.Conn, mongoM mongodb.Manager, logger *simplelogger.SimpleLogger) *HandlerContext {
	return &HandlerContext{
		cfg:    cfg,
		nc:     nc,
		mongoM: mongoM,
		values: map[string]interface{}{},
		Logger: logger,
	}
}

func (c *HandlerContext) GetPath(relativePath string) string {
	return path.Join(c.cfg.BasePath, relativePath)
}

func (c *HandlerContext) SetValue(key string, value interface{}) {
	c.values[key] = value
}

func (c *HandlerContext) GetValue(key string) interface{} {
	if val, ok := c.values[key]; ok {
		return val
	}
	c.Logger.Infof("Error getting value for key '%s' returning nil", key)
	return nil
}

func (c *HandlerContext) GetValueString(key string) string {
	v := c.GetValue(key)
	if val, ok := v.(string); ok {
		return val
	}
	c.Logger.Infof("Error getting value for key '%s' is not a string", key)
	return ""
}

func (c *HandlerContext) GetValueInt(key string) int {
	v := c.GetValue(key)
	if val, ok := v.(int); ok {
		return val
	}
	c.Logger.Infof("Error getting value for key '%s' is not a int", key)
	return -1
}

func (c *HandlerContext) GetValueFloat(key string) float64 {
	v := c.GetValue(key)
	if val, ok := v.(float64); ok {
		return val
	}
	c.Logger.Infof("Error getting value for key '%s' is not a float64", key)
	return -1.0
}

func (c *HandlerContext) SaveMetric(date time.Time, predictedValue, trueValue string) {
	msg, err := json.Marshal(SaveMetricMsg{
		Coll: classificationMetricsColl,
		Doc: SaveMetricMsgDoc{
			Date:           date.Format(time.RFC3339),
			PredictedValue: predictedValue,
			TrueValue:      trueValue,
			VersionID:      c.cfg.VersionID,
			VersionName:    c.cfg.Version,
		},
	})

	if err != nil {
		c.Logger.Infof("Error marshalling SaveMetricMsgDoc: %s", err)
		return
	}

	_, err = c.nc.Request(c.cfg.NATS.MongoWriterSubject, msg, saveMetricTimeout)
	if err != nil {
		c.Logger.Infof("Error sending metric to NATS: %s", err)
	}
}

func (c *HandlerContext) SaveMetricError(saveMetricErr SaveMetricErr) {
	if err := saveMetricErr.IsValid(); err != nil {
		c.Logger.Error(err.Error())
		return
	}

	msg, err := json.Marshal(SaveMetricMsg{
		Coll: classificationMetricsColl,
		Doc: SaveMetricMsgDoc{
			Date:        time.Now().Format(time.RFC3339),
			VersionName: c.cfg.Version,
			Error:       string(saveMetricErr),
		},
	})
	if err != nil {
		c.Logger.Infof("Error generating SaveMetricMsg JSON: %s", err)
	}

	_, err = c.nc.Request(c.cfg.NATS.MongoWriterSubject, msg, saveMetricTimeout)
	if err != nil {
		c.Logger.Infof("Error sending error metric to NATS: %s", err)
	}
}

func (c *HandlerContext) SaveData(collection string, data interface{}) error {

	msg, err := json.Marshal(SaveDataMsg{
		Coll: collection,
		Doc:  data,
	})
	if err != nil {
		c.Logger.Infof("Error generating SaveDataMsg JSON: %s", err)
	}

	_, err = c.nc.Request(c.cfg.NATS.MongoWriterSubject, msg, saveDataTimeout)
	return err
}

type QueryData map[string]interface{}

func (c *HandlerContext) GetData(colName string, query QueryData, res interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), getDataTimeout)
	defer cancel()

	criteria := bson.M{}
	for k, v := range query {
		criteria[k] = v
	}

	return c.mongoM.Find(ctx, colName, criteria, res)
}
