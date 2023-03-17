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

func New(logger logging.Logger, js nats.JetStreamContext) *NatsClient {
	return &NatsClient{
		logger: logger,
		js:     js,
	}
}

func InitJetStreamConnection(url string) (nats.JetStreamContext, error) {
	natsConn, err := nats.Connect(url)
	if err != nil {
		return nil, fmt.Errorf("error connecting to NATS: %w", err)
	}

	js, err := natsConn.JetStream()
	if err != nil {
		return nil, fmt.Errorf("error connecting to NATS JetStream: %w", err)
	}

	return js, nil
}

func (n *NatsClient) CreateStream(streamConfig *entity.StreamConfig) error {
	n.logger.Infof("Creating stream  %q", streamConfig.Stream)

	subjects := n.getNodesSubjects(streamConfig.Nodes)

	streamCfg := &nats.StreamConfig{
		Name:        streamConfig.Stream,
		Description: "",
		Subjects:    append(subjects, streamConfig.EntrypointSubject),
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
		return fmt.Errorf("error creating the object store: %w", err)
	}

	return nil
}

// GetObjectStoresNames returns the list of object stores.
//
// Caution: ObjectStore's names returned from nats client have a "OBJ_" prefix that needs to be discarded.
// This method removes the prefix and returns the list of object stores names.
func (n *NatsClient) GetObjectStoresNames() []string {
	objectStoresCh := n.js.ObjectStores()

	var objectStores []string
	for objectStore := range objectStoresCh {
		objectStores = append(objectStores, objectStore.Bucket())
	}

	return objectStores
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

// GetStreamsNames returns the list of streams' names.
func (n *NatsClient) GetStreamsNames() []string {
	namesChannel := n.js.StreamNames()
	names := make([]string, 0)
	for name := range namesChannel {
		names = append(names, name)
	}

	return names
}

func (n *NatsClient) getNodesSubjects(nodes entity.NodesStreamConfig) []string {
	subjects := make([]string, 0, len(nodes)*2)

	for _, nodeCfg := range nodes {
		subSubject := nodeCfg.Subject + ".*"
		subjects = append(subjects, nodeCfg.Subject, subSubject)
	}

	return subjects
}
