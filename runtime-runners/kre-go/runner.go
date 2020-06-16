package kre

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"github.com/nats-io/nats.go"
)

type Result struct {
	Reply string `json:"reply"`
	Data  string `json:"data"`
	Error string `json:"error"`
}

type HandlerInit func(ctx *HandlerContext)
type Handler func(ctx *HandlerContext, data []byte) (interface{}, error)

func Start(handlerInit HandlerInit, handler Handler) {
	logger := simplelogger.New(simplelogger.LevelDebug)
	logger.Info("Starting runner...")

	cfg := NewConfig(logger)
	nc, err := nats.Connect(cfg.NATS.Server)
	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}
	defer nc.Close()

	c := NewHandlerContext(cfg, nc, logger)
	handlerInit(c)

	s, err := nc.Subscribe(cfg.NATS.InputSubject, func(msg *nats.Msg) {
		logger.Infof("Received a message on '%s' with reply '%s'", msg.Subject, msg.Reply)

		r := &Result{}
		err = json.Unmarshal(msg.Data, r)
		if err != nil {
			logger.Infof("Error parsing msg.data because is not a valid JSON: %s", err)
			return
		}

		if r.Reply == "" && msg.Reply == "" {
			logger.Infof("Error: the reply subject was not found")
			return
		}

		if msg.Reply != "" {
			r.Reply = msg.Reply
		}

		handlerResult, err := handler(c, []byte(r.Data))
		if err != nil {
			logger.Errorf("Error executing handler: %s", err)

			errResultJSON, err := json.Marshal(Result{
				Error: fmt.Sprintf("error in '%s': %s", cfg.NodeName, err),
			})
			if err != nil {
				logger.Errorf("Error generating error output because it is not a serializable JSON: %s", err)
				return
			}

			err = nc.Publish(r.Reply, errResultJSON)
			if err != nil {
				logger.Errorf("Error publishing error output: %s", err)
			}
		}

		handlerResultJSON, err := json.Marshal(handlerResult)
		if err != nil {
			logger.Errorf("Error generating output result because handler result is not a serializable JSON: %s", err)
			return
		}

		var outputSubject string
		isLastNode := cfg.NATS.OutputSubject == ""
		if isLastNode {
			outputSubject = r.Reply
		} else {
			outputSubject = cfg.NATS.OutputSubject
		}

		outputResultJSON, err := json.Marshal(Result{
			Reply: r.Reply,
			Data:  string(handlerResultJSON),
		})
		if err != nil {
			logger.Errorf("Error generating output result because it is not a serializable JSON: %s", err)
			return
		}

		logger.Infof("Publish response to '%s' subject", outputSubject)
		err = nc.Publish(outputSubject, outputResultJSON)
		if err != nil {
			logger.Errorf("Error publishing output: %s", err)
		}
	})

	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}

	logger.Infof("Listening to '%s' subject", cfg.NATS.InputSubject)

	// Handle sigterm and await termChan signal
	termChan := make(chan os.Signal, 1)
	signal.Notify(termChan, syscall.SIGINT, syscall.SIGTERM)
	<-termChan

	// Handle shutdown
	logger.Info("Shutdown signal received")

	err = s.Unsubscribe()
	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}
}
