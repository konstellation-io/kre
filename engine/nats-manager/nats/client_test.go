//go:build integration

package nats_test

import (
	"context"
	"log"
	"testing"

	"github.com/konstellation-io/kre/libs/simplelogger"
	natslib "github.com/nats-io/nats.go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/entity"
	"github.com/konstellation-io/kre/engine/nats-manager/nats"
)

type ClientTestSuite struct {
	suite.Suite
	natsContainer testcontainers.Container
	natsClient    *nats.NatsClient
	js            natslib.JetStreamContext
}

func TestClientTestSuite(t *testing.T) {
	suite.Run(t, new(ClientTestSuite))
}

func (s *ClientTestSuite) SetupSuite() {
	ctx := context.Background()
	req := testcontainers.ContainerRequest{
		Image:        "nats:2.8.1",
		Cmd:          []string{"-js"},
		ExposedPorts: []string{"4222/tcp", "8222/tcp"},
		WaitingFor:   wait.ForLog("Server is ready"),
	}

	natsContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		log.Fatal(err)
	}

	natsEndpoint, err := natsContainer.Endpoint(ctx, "")
	if err != nil {
		log.Fatalf("error getting nats container endpoint: %s", err.Error())
	}

	js, err := nats.InitJetStreamConnection(natsEndpoint)
	if err != nil {
		log.Fatalf("error connecting to NATS JetStream: %s", err)
	}

	logger := simplelogger.New(simplelogger.LevelDebug)
	natsClient := nats.New(logger, js)

	s.js = js
	s.natsContainer = natsContainer
	s.natsClient = natsClient
}

func (s *ClientTestSuite) TearDownSuite() {
	if err := s.natsContainer.Terminate(context.Background()); err != nil {
		log.Fatalf("failed to terminate container: %s", err.Error())
	}
}

func (s *ClientTestSuite) AfterTest(_, _ string) {
	streams := s.js.StreamNames()

	for stream := range streams {
		err := s.js.DeleteStream(stream)
		if err != nil {
			log.Fatalf("error deleting stream %q: %s", stream, err)
		}
	}
}

func (s *ClientTestSuite) TestNatsClient_CreateStream() {
	t := s.T()

	testNodeSubject := "test-stream-test-subject"
	testEntrypointSubject := "test-stream-entrypoint"

	streamConfig := &entity.StreamConfig{
		Stream: "test-stream",
		Nodes: entity.NodesStreamConfig{
			"test-node": entity.NodeStreamConfig{
				Subject: testNodeSubject,
			},
		},
		EntrypointSubject: "test-stream-entrypoint",
	}

	err := s.natsClient.CreateStream(streamConfig)
	assert.NoError(t, err)

	expectedSubjects := []string{
		testNodeSubject,
		testNodeSubject + ".*",
		testEntrypointSubject,
	}

	streams := s.js.Streams()

	amountOfStreams := 0
	for stream := range streams {
		assert.Equal(t, streamConfig.Stream, stream.Config.Name)
		assert.Equal(t, expectedSubjects, stream.Config.Subjects)
		amountOfStreams++
	}

	assert.Equal(t, 1, amountOfStreams)
}

func (s *ClientTestSuite) TestNatsClient_CreateStream_ErrorIfStreamAlreadyExists() {
	t := s.T()

	testStream := "test-stream"
	testNodeSubject := "test-stream-test-subject"

	streamConfig := &entity.StreamConfig{
		Stream: testStream,
		Nodes: entity.NodesStreamConfig{
			"test-node": entity.NodeStreamConfig{
				Subject: testNodeSubject,
			},
		},
		EntrypointSubject: "test-stream-entrypoint",
	}

	_, err := s.js.AddStream(&natslib.StreamConfig{
		Name:      testStream,
		Retention: natslib.InterestPolicy,
	})
	assert.NoError(t, err)

	err = s.natsClient.CreateStream(streamConfig)
	assert.ErrorIs(t, err, natslib.ErrStreamNameAlreadyInUse)
}

func (s *ClientTestSuite) TestNatsClient_DeleteStream() {
	t := s.T()

	testStream := "test-stream"

	_, err := s.js.AddStream(&natslib.StreamConfig{
		Name:      testStream,
		Retention: natslib.InterestPolicy,
	})
	assert.NoError(t, err)

	err = s.natsClient.DeleteStream(testStream)
	assert.NoError(t, err)

	streams := s.js.Streams()

	assert.Nil(t, <-streams)
}

func (s *ClientTestSuite) TestNatsClient_DeleteStream_ErrorIfStreamDoesntExist() {
	t := s.T()

	testStream := "test-stream"

	err := s.natsClient.DeleteStream(testStream)
	assert.Error(t, err, natslib.ErrStreamNotFound)
}

func (s *ClientTestSuite) TestNatsClient_CreateObjectStore() {
	t := s.T()

	testObjectStore := "test-objstore"

	err := s.natsClient.CreateObjectStore(testObjectStore)
	assert.NoError(t, err)

	objectStores := s.js.ObjectStores()

	objectStore := <-objectStores
	assert.Equal(t, testObjectStore, objectStore.Bucket())

	assert.Equal(t, nil, <-objectStores)
}

func (s *ClientTestSuite) TestNatsClient_CreateObjectStore_NoErrorWhenObjectStoreAlreadyExistsWithSameConfig() {
	t := s.T()

	testObjectStore := "test-objstore"

	_, err := s.js.CreateObjectStore(&natslib.ObjectStoreConfig{
		Bucket:  testObjectStore,
		Storage: natslib.FileStorage,
	})
	assert.NoError(t, err)

	err = s.natsClient.CreateObjectStore(testObjectStore)
	assert.NoError(t, err)
}

func (s *ClientTestSuite) TestNatsClient_CreateObjectStore_ErrorWhenObjectStoreAlreadyExistsWithDiffConfig() {
	t := s.T()

	testObjectStore := "test-objstore"

	_, err := s.js.CreateObjectStore(&natslib.ObjectStoreConfig{
		Bucket:  testObjectStore,
		Storage: natslib.MemoryStorage,
	})
	assert.NoError(t, err)

	err = s.natsClient.CreateObjectStore(testObjectStore)
	assert.ErrorIs(t, err, natslib.ErrStreamNameAlreadyInUse)
}

func (s *ClientTestSuite) TestNatsClient_DeleteObjectStore() {
	t := s.T()

	testObjectStore := "test-objstore"

	_, err := s.js.CreateObjectStore(&natslib.ObjectStoreConfig{
		Bucket:  testObjectStore,
		Storage: natslib.FileStorage,
	})
	assert.NoError(t, err)

	err = s.natsClient.DeleteObjectStore(testObjectStore)
	assert.NoError(t, err)

	objectStores := s.js.ObjectStores()
	assert.Nil(t, <-objectStores)
}

func (s *ClientTestSuite) TestNatsClient_DeleteObjectStore_ObjectStoreNotFound() {
	t := s.T()

	testObjectStore := "test-objstore"

	err := s.natsClient.DeleteObjectStore(testObjectStore)
	assert.ErrorIs(t, err, natslib.ErrStreamNotFound)
}

func (s *ClientTestSuite) TestNatsClient_GetObjectStoresNames() {
	t := s.T()

	expectedObjectStores := []string{
		"test-project_test-version_test-workflow",
		"test-project_test-version_test-workflow_test-name",
	}

	for _, objStore := range expectedObjectStores {
		_, err := s.js.CreateObjectStore(&natslib.ObjectStoreConfig{
			Bucket:  objStore,
			Storage: natslib.FileStorage,
		})
		assert.NoError(t, err)
	}

	objectStores := s.natsClient.GetObjectStoresNames()

	assert.Equal(t, expectedObjectStores, objectStores)
}
