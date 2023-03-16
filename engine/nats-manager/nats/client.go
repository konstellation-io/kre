package nats

import (
	"fmt"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/entity"
	logging "github.com/konstellation-io/kre/engine/nats-manager/internal/logger"
	"github.com/nats-io/nats.go"
)

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

func (n *NatsClient) CreateStream(streamConfig *entity.StreamConfig) error {
	n.logger.Infof("Creating stream  %q", streamConfig.Stream)

	subjects := n.getNodesSubjects(streamConfig.Nodes)

	streamCfg := &nats.StreamConfig{
		Name:        streamConfig.Stream,
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

// GetObjectStoresNames returns the list of object stores.
//
// Caution: ObjectStore's names returned from nats client have a "OBJ_" prefix that needs to be discarded.
// This method removes the prefix and returns the list of object stores names.
func (n *NatsClient) GetObjectStoresNames() []string {
	namesChannel := n.js.ObjectStoreNames()

	names := make([]string, 0)
	for name := range namesChannel {
		names = append(names, name[4:])
	}

	return names
}

func (n *NatsClient) DeleteStream(stream string) error {
	n.logger.Infof("Deleting stream %q", stream)
	err := n.js.DeleteStream(stream)
	return err
}

func (n *NatsClient) DeleteObjectStore(objectStore string) error {
	n.logger.Infof("Deleting object store %q", objectStore)
	err := n.js.DeleteObjectStore(objectStore)
	return err
}

func (n *NatsClient) getNodesSubjects(nodes entity.NodesStreamConfig) []string {
	subjects := make([]string, 0, len(nodes)*2)

	for _, nodeCfg := range nodes {
		subSubject := nodeCfg.Subject + ".*"
		subjects = append(subjects, nodeCfg.Subject, subSubject)
	}

	fmt.Println(subjects)

	return subjects
}
