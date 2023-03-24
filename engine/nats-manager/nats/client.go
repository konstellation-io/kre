package nats

import (
	"fmt"
	"regexp"

	"github.com/nats-io/nats.go"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/entity"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/errors"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/logging"
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

func (n *NatsClient) CreateObjectStores(objectStore string) error {
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

// GetObjectStoreNames returns the list of object stores.
// The optional param `optFilter` accepts 0 or 1 value.
func (n *NatsClient) GetObjectStoreNames(optFilter ...*regexp.Regexp) ([]string, error) {
	if len(optFilter) > 1 {
		return nil, errors.ErrNoOptFilter
	}

	var regexpFilter *regexp.Regexp
	if len(optFilter) == 1 {
		regexpFilter = optFilter[0]
	}

	objectStoresCh := n.js.ObjectStores()
	objectStores := make([]string, 0)

	for objectStore := range objectStoresCh {
		objStoreName := objectStore.Bucket()

		nameMatchFilter := regexpFilter == nil || regexpFilter.MatchString(objStoreName)
		if nameMatchFilter {
			objectStores = append(objectStores, objStoreName)
		}
	}

	return objectStores, nil
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
	n.logger.Infof("Deleting stream %q", stream)
	err := n.js.DeleteStream(stream)
	return err
}

func (n *NatsClient) DeleteObjectStore(objectStore string) error {
	n.logger.Infof("Deleting object store %q", objectStore)
	err := n.js.DeleteObjectStore(objectStore)
	return err
}

// GetStreamNames returns the list of streams' names.
// The optional param `optFilter` accepts 0 or 1 value.
func (n *NatsClient) GetStreamNames(optFilter ...*regexp.Regexp) ([]string, error) {
	if len(optFilter) > 1 {
		return nil, errors.ErrNoOptFilter
	}

	var regexpFilter *regexp.Regexp
	if len(optFilter) == 1 {
		regexpFilter = optFilter[0]
	}

	streamsChannel := n.js.StreamNames()
	streams := make([]string, 0)

	for streamName := range streamsChannel {
		nameMatchFilter := regexpFilter == nil || regexpFilter.MatchString(streamName)
		if nameMatchFilter {
			streams = append(streams, streamName)
		}
	}

	return streams, nil
}

func (n *NatsClient) getNodesSubjects(nodes entity.NodesStreamConfig) []string {
	subjects := make([]string, 0, len(nodes)*2)

	for _, nodeCfg := range nodes {
		subSubject := nodeCfg.Subject + ".*"
		subjects = append(subjects, nodeCfg.Subject, subSubject)
	}

	return subjects
}
