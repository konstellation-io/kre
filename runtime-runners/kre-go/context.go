package kre

import (
	"encoding/json"
	"fmt"
	"log"
	"path"
	"time"

	"github.com/nats-io/nats.go"
)

type SaveMetricErr string

var saveMetricTimeout = 1 * time.Second

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
	VersionId      string `json:"versionId"`
}

type HandlerContext struct {
	cfg    Config
	nc     *nats.Conn
	values map[string]interface{}
}

func NewHandlerContext(cfg Config, nc *nats.Conn) *HandlerContext {
	return &HandlerContext{
		cfg:    cfg,
		nc:     nc,
		values: map[string]interface{}{},
	}
}

func (c *HandlerContext) GetPath(relativePath string) string {
	return path.Join(c.cfg.BasePath, relativePath)
}

func (c *HandlerContext) SetValue(key string, value interface{}) {
	c.values[key] = value
}

func (c *HandlerContext) SetValueString(key string, value string) {
	c.values[key] = value
}

func (c *HandlerContext) SetValueInt(key string, value int) {
	c.values[key] = value
}

func (c *HandlerContext) SetValueFloat(key string, value float64) {
	c.values[key] = value
}

func (c *HandlerContext) GetValue(key string) interface{} {
	if val, ok := c.values[key]; ok {
		return val
	}
	log.Printf("Error getting value for key '%s' returning nil", key)
	return nil
}

func (c *HandlerContext) GetValueString(key string) string {
	v := c.GetValue(key)
	if val, ok := v.(string); ok {
		return val
	}
	log.Printf("Error getting value for key '%s' is not a string", key)
	return ""
}

func (c *HandlerContext) GetValueInt(key string) int {
	v := c.GetValue(key)
	if val, ok := v.(int); ok {
		return val
	}
	log.Printf("Error getting value for key '%s' is not a int", key)
	return -1
}

func (c *HandlerContext) GetValueFloat(key string) float64 {
	v := c.GetValue(key)
	if val, ok := v.(float64); ok {
		return val
	}
	log.Printf("Error getting value for key '%s' is not a float64", key)
	return -1.0
}

func (c *HandlerContext) SaveMetric(date time.Time, predictedValue, trueValue string) {
	msg, err := json.Marshal(SaveMetricMsg{
		Coll: classificationMetricsColl,
		Doc: SaveMetricMsgDoc{
			Date:           date.Format(time.RFC3339),
			PredictedValue: predictedValue,
			TrueValue:      trueValue,
			VersionId:      c.cfg.Version,
		},
	})

	if err != nil {
		log.Printf("Error marshalling SaveMetricMsgDoc: %s", err)
		return
	}

	_, err = c.nc.Request(c.cfg.NATS.MongoWriterSubject, msg, saveMetricTimeout)
	if err != nil {
		log.Printf("Error sending metric to NATS: %s", err)
	}
}

func (c *HandlerContext) SaveMetricError(saveMetricErr SaveMetricErr) {
	if err := saveMetricErr.IsValid(); err != nil {
		log.Println(err)
		return
	}

	msg, err := json.Marshal(SaveMetricMsg{
		Coll: classificationMetricsColl,
		Doc: SaveMetricMsgDoc{
			Date:      time.Now().Format(time.RFC3339),
			VersionId: c.cfg.Version,
			Error:     string(saveMetricErr),
		},
	})
	if err != nil {
		log.Printf("Error generating SaveMetricMsg JSON: %s", err)
	}

	_, err = c.nc.Request(c.cfg.NATS.MongoWriterSubject, msg, saveMetricTimeout)
	if err != nil {
		log.Printf("Error sending error metric to NATS: %s", err)
	}
}
