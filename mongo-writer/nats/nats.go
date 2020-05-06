package nats

import (
	nc "github.com/nats-io/nats.go"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"os"

	"gitlab.com/konstellation/kre/mongo-writer/config"
)

type NATSManager struct {
	cfg           *config.Config
	logger        *simplelogger.SimpleLogger
	nc            *nc.Conn
	subscriptions []*nc.Subscription
	TotalMsgs     int
}

func NewNATSManager(cfg *config.Config, logger *simplelogger.SimpleLogger) *NATSManager {
	return &NATSManager{
		cfg:    cfg,
		logger: logger,
	}
}

func (n *NATSManager) Connect() error {
	n.logger.Info("NATS connecting...")
	conn, err := nc.Connect(n.cfg.Nats.Server)
	if err != nil {
		return err
	}

	n.logger.Info("NATS connected")
	n.nc = conn
	return nil
}

func (n *NATSManager) Disconnect() {
	n.logger.Info("NATS disconnecting...")
	if n.subscriptions != nil {
		for _, s := range n.subscriptions {
			n.logger.Infof("NATS unsubscribe from %s...", s.Subject)
			if err := s.Unsubscribe(); err != nil {
				n.logger.Infof("NATS unsubscribe from %s error: %s", s.Subject, err)
			}
		}
	}

	n.nc.Close()
	n.logger.Info("NATS disconnected")
}

func (n *NATSManager) SubscribeToChannel(channel string) chan *nc.Msg {
	n.logger.Infof("NATS subscribe to channel: %s...", channel)
	msgCh := make(chan *nc.Msg, 64)

	sub, err := n.nc.ChanSubscribe(channel, msgCh)
	if err != nil {
		n.logger.Errorf("Error subscribing to '%s' NATS channel: %s", channel, err)
		os.Exit(1)
	}

	n.logger.Infof("NATS subscribed to channel: %s", channel)
	n.subscriptions = append(n.subscriptions, sub)
	return msgCh
}
