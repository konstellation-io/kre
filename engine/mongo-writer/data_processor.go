package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/konstellation-io/kre/engine/mongo-writer/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/mongodb"
	"github.com/konstellation-io/kre/engine/mongo-writer/nats"
	"github.com/konstellation-io/kre/libs/simplelogger"
	nc "github.com/nats-io/nats.go"
)

type DataMsg struct {
	Coll string      `json:"coll"`
	Doc  interface{} `json:"doc"`
}

type DataMsgResponse struct {
	Success bool `json:"success"`
}

type DataProcessor struct {
	cfg    *config.Config
	logger *simplelogger.SimpleLogger
	mongoM *mongodb.MongoDB
	natsM  *nats.NATSManager
}

func NewDataProcessor(
	cfg *config.Config,
	logger *simplelogger.SimpleLogger,
	mongoM *mongodb.MongoDB,
	natsM *nats.NATSManager,
) *DataProcessor {
	return &DataProcessor{
		cfg:    cfg,
		logger: logger,
		mongoM: mongoM,
		natsM:  natsM,
	}
}

func (d *DataProcessor) ProcessMsgs(ctx context.Context, dataCh chan *nc.Msg) {
	for msg := range dataCh {
		d.natsM.TotalMsgs += 1

		dataMsg, err := d.getData(msg)
		if err != nil {
			d.errorResponse(msg, err)
			continue
		}

		err = d.mongoM.InsertOne(ctx, d.cfg.MongoDB.DataDBName, dataMsg.Coll, dataMsg.Doc)
		if err != nil {
			d.errorResponse(msg, fmt.Errorf("error inserting in Mongodb: %s", err))
			continue
		}

		d.successResponse(msg)
	}
}

func (d *DataProcessor) getData(msg *nc.Msg) (*DataMsg, error) {
	var (
		data []byte
		err  error
	)

	if isCompressed(msg.Data) {
		data, err = uncompress(msg.Data)
		if err != nil {
			return nil, fmt.Errorf("error uncompressing msg: %s", err)
		}
	} else {
		data = msg.Data
	}

	dataMsg := DataMsg{}
	err = json.Unmarshal(data, &dataMsg)
	if err != nil {
		return nil, fmt.Errorf("error parsing data msg: %s", err)
	}

	return &dataMsg, nil
}

func (d *DataProcessor) successResponse(msg *nc.Msg) {
	d.response(msg, true)
}

func (d *DataProcessor) errorResponse(msg *nc.Msg, err error) {
	d.logger.Errorf("Error: %s", err)
	d.response(msg, false)
}

func (d *DataProcessor) response(msg *nc.Msg, success bool) {
	res := DataMsgResponse{
		Success: success,
	}

	resJSON, err := json.Marshal(res)
	if err != nil {
		d.logger.Errorf("Error marshaling the data msg response: %s", err)
		return
	}

	err = msg.Respond(resJSON)
	if err != nil {
		d.logger.Errorf("Error replaying to the data msg: %s", err)
	}
}
