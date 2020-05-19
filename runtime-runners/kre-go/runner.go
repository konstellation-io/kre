package kre

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/nats-io/nats.go"
)

type Result struct {
	Reply string
	Data  string
	Error string
}

type HandlerInit func(ctx *HandlerContext)
type Handler func(ctx *HandlerContext, data []byte) (interface{}, error)

func Start(handlerInit HandlerInit, handler Handler) {
	cfg := NewConfig()
	nc, err := nats.Connect(cfg.NATS.Server)
	if err != nil {
		log.Fatal(err)
	}
	defer nc.Close()

	c := NewHandlerContext(cfg, nc)
	handlerInit(c)

	s, err := nc.Subscribe(cfg.NATS.InputSubject, func(msg *nats.Msg) {
		log.Printf("Received a message on '%s' with reply '%s'", msg.Subject, msg.Reply)

		r := &Result{}
		err = json.Unmarshal(msg.Data, r)
		if err != nil {
			log.Printf("Error parsing msg.data because is not a valid JSON: %s", err)
			return
		}

		if r.Reply == "" && msg.Reply == "" {
			log.Println("Error: the reply subject was not found")
			return
		}

		if msg.Reply != "" {
			r.Reply = msg.Reply
		}

		handlerResult, err := handler(c, []byte(r.Data))
		if err != nil {
			log.Printf("Error executing handler: %s", err)

			errResultJSON, err := json.Marshal(Result{
				Error: fmt.Sprintf("error in '%s': %s", cfg.NodeName, err),
			})
			if err != nil {
				log.Printf("Error generating error output because it is not a serializable JSON: %s", err)
				return
			}

			err = nc.Publish(r.Reply, errResultJSON)
			if err != nil {
				log.Printf("Error publishing error output: %s", err)
			}
		}

		handlerResultJSON, err := json.Marshal(handlerResult)
		if err != nil {
			log.Printf("Error generating output result because handler result is not a serializable JSON: %s", err)
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
			log.Printf("Error generating output result because it is not a serializable JSON: %s", err)
			return
		}

		log.Printf("Publish response to '%s' subject", outputSubject)
		err = nc.Publish(outputSubject, outputResultJSON)
		if err != nil {
			log.Printf("Error publishing output: %s", err)
		}
	})

	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Listening to '%s' subject", cfg.NATS.InputSubject)

	// Handle sigterm and await termChan signal
	termChan := make(chan os.Signal, 1)
	signal.Notify(termChan, syscall.SIGINT, syscall.SIGTERM)
	<-termChan

	// Handle shutdown
	log.Println("Shutdown signal received")

	err = s.Unsubscribe()
	if err != nil {
		log.Fatal(err)
	}
}
