package kre

import (
	"context"
	"encoding/json"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"github.com/nats-io/nats.go"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/konstellation-io/kre/runners/kre-go/config"
	"github.com/konstellation-io/kre/runners/kre-go/mongodb"
)

type SaveDataMsg struct {
	Coll string      `json:"coll"`
	Doc  interface{} `json:"doc"`
}

type contextData struct {
	cfg    config.Config
	nc     *nats.Conn
	mongoM mongodb.Manager
	Logger *simplelogger.SimpleLogger
}

func (c *contextData) Find(colName string, query QueryData, res interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), getDataTimeout)
	defer cancel()

	criteria := bson.M{}
	for k, v := range query {
		criteria[k] = v
	}

	return c.mongoM.Find(ctx, colName, criteria, res)
}

func (c *contextData) Save(collection string, data interface{}) error {
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
