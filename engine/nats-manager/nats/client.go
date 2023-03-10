package nats

import (
	"fmt"

	logging "github.com/konstellation-io/kre/engine/nats-manager/logger"
	"github.com/nats-io/nats.go"
)

//go:generate mockgen -source=${GOFILE} -destination=../mocks/${GOFILE} -package=mocks

type Client interface {
	Connect(url string) error
	CreateStream(stream string, subjects []string) error
	CreateObjectStore(objectStore string) error
	CreateKeyValueStore(keyValueStore string) error
	DeleteStream(stream string) error
}

type NatsClient struct {
	js     nats.JetStreamContext
	logger logging.Logger
}

func New(logger logging.Logger) *NatsClient {
	return &NatsClient{
		logger: logger,
	}
}

func (n *NatsClient) Connect(url string) error {
	n.logger.Info("Connecting to NATS...")
	natsConn, err := nats.Connect(url)
	if err != nil {
		return fmt.Errorf("error connecting to NATS: %w", err)
	}
	js, err := natsConn.JetStream()
	if err != nil {
		return fmt.Errorf("error connecting to NATS JetStream: %w", err)
	}
	n.js = js
	return nil
}

func (n *NatsClient) CreateStream(stream string, subjects []string) error {
	n.logger.Infof("Creating stream \"%s\"", stream)
	streamCfg := &nats.StreamConfig{
		Name:        stream,
		Description: "",
		Subjects:    subjects,
		Retention:   nats.InterestPolicy,
	}

	_, err := n.js.AddStream(streamCfg)
	return err
}

func (n *NatsClient) CreateObjectStore(objectStore string) error {
	n.logger.Infof("Creating object store %q", objectStore)

	_, err := n.js.CreateObjectStore(&nats.ObjectStoreConfig{
		Bucket:  objectStore,
		Storage: nats.FileStorage,
	})
	if err != nil {
		return fmt.Errorf("error creating the object store: %s", err)
	}

	return nil
}

func (n *NatsClient) CreateKeyValueStore(keyValueStore string) error {
	n.logger.Infof("Creating key-value store %q", keyValueStore)

	_, err := n.js.CreateKeyValue(&nats.KeyValueConfig{
		Bucket: keyValueStore,
	})
	if err != nil {
		return fmt.Errorf("error creating the key-value store: %s", err)
	}

	return nil
}

func (n *NatsClient) DeleteStream(stream string) error {
	n.logger.Infof("Deleting stream \"%s\"", stream)
	err := n.js.DeleteStream(stream)
	return err
}
