package nats

import (
	"fmt"
	"time"

	nc "github.com/nats-io/nats.go"
	"github.com/nats-io/stan.go"

	"gitlab.com/konstellation/konstellation-ce/kre/mongo-writer/config"
	"gitlab.com/konstellation/konstellation-ce/kre/mongo-writer/logging"
)

// Connect to a server
type Nats struct {
	cfg    *config.Config
	logger *logging.Logger

	TotalMsgs int

	// Nats
	nc   *nc.Conn
	nsub *nc.Subscription

	// NATS streaming
	sc   stan.Conn
	ssub stan.Subscription
}

func NewNats(cfg *config.Config, logger *logging.Logger) *Nats {
	return &Nats{
		cfg:    cfg,
		logger: logger,
	}
}

func (n *Nats) SubscribeToChannel(channel string) (chan *nc.Msg, error) {
	msgCh := make(chan *nc.Msg, 64)
	sub, err := n.nc.ChanSubscribe(channel, msgCh)
	if err != nil {
		return nil, err
	}

	n.nsub = sub
	return msgCh, nil
}

func (n *Nats) ConnectNats() error {
	n.logger.Info("Nats connecting...")

	conn, err := nc.Connect(n.cfg.Nats.Server)
	if err != nil {
		return err
	}

	n.nc = conn
	return nil
}

func (n *Nats) Disconnect() error {
	if n.ssub != nil {
		n.nc.Close()
		return nil
	}

	return nil
}

func (n *Nats) ConnectNatsStreaming() error {
	n.logger.Info("Nats streaming connecting...")
	clientID := "mongo-writer"

	sc, err := stan.Connect(
		n.cfg.Nats.ClusterID,
		clientID,
		stan.NatsURL(n.cfg.Nats.Server),
	)
	if err != nil {
		return err
	}

	n.sc = sc
	return nil
}

func (n *Nats) DisconnectNatsStreaming() error {
	if n.ssub != nil {
		err := n.ssub.Unsubscribe()
		if err != nil {
			return err
		}
	}
	if n.sc != nil {
		err := n.sc.Close()
		if err != nil {
			return err
		}
	}
	return nil
}

type MsgParserFn func(msg *stan.Msg) error

func (n *Nats) SubscribeToSubject(subject string, fn MsgParserFn) error {
	durableID := "mongo-writer"

	// Subscribe with manual ack mode, and set AckWait to 20 seconds
	aw, _ := time.ParseDuration("20s")
	sub, err := n.sc.Subscribe(subject,
		n.streamingMsgParser(fn),
		stan.DurableName(durableID),
		stan.MaxInflight(25),
		stan.SetManualAckMode(),
		stan.AckWait(aw),
	)
	if err != nil {
		return err
	}
	n.ssub = sub
	return nil
}

func (n *Nats) streamingMsgParser(fn MsgParserFn) func(msg *stan.Msg) {
	return func(msg *stan.Msg) {
		err := fn(msg)
		if err != nil {
			n.logger.Error(err.Error())
			return
		}

		err = msg.Ack() // Manual ACK
		if err != nil {
			n.logger.Error(fmt.Sprintf("ACK ERROR: %s", err.Error()))
			return
		}
	}
}
