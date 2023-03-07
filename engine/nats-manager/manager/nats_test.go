package manager_test

import (
	"fmt"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/engine/nats-manager/manager"
	"github.com/konstellation-io/kre/engine/nats-manager/mocks"
	"github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"
	"github.com/stretchr/testify/require"
)

func TestCreateStreams(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)

	const (
		runtimeID          = "test-runtime"
		versionName        = "test-version"
		workflowName       = "test-workflow"
		workflowEntrypoint = "TestWorkflow"
		streamName         = "test-runtime-test-version-TestWorkflow"
		testNode           = "test-node"
		testNodeSubject    = "test-runtime-test-version-TestWorkflow.test-node"
	)

	workflows := []*natspb.Workflow{
		{
			Name:       workflowName,
			Entrypoint: workflowEntrypoint,
			Nodes: []*natspb.Node{
				{
					Name:          testNode,
					Subscriptions: nil,
				},
			},
		},
	}
	subjectsToCreate := []string{
		testNodeSubject,
		testNodeSubject + ".*",
	}

	client.EXPECT().CreateStream(streamName, subjectsToCreate).Return(nil)
	actualErr := natsManager.CreateStreams(runtimeID, versionName, workflows)
	require.Nil(t, actualErr)
}

func TestCreateStreams_ClientFails(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)

	const (
		runtimeID           = "test-runtime"
		versionName         = "test-version"
		workflowName        = "test-workflow"
		workflowEntrypoint  = "TestWorkflow"
		streamName          = "test-runtime-test-version-TestWorkflow"
		testNode            = "test-node"
		testNodeSubject     = "test-runtime-test-version-TestWorkflow.test-node"
		testNodeSubsubjects = "test-runtime-test-version-TestWorkflow.test-node.*"
	)

	workflows := []*natspb.Workflow{
		{
			Name:       workflowName,
			Entrypoint: workflowEntrypoint,
			Nodes: []*natspb.Node{
				{
					Name:          testNode,
					Subscriptions: nil,
				},
			},
		},
	}

	expectedError := fmt.Errorf("stream already exists")

	client.EXPECT().CreateStream(streamName, []string{testNodeSubject, testNodeSubsubjects}).Return(fmt.Errorf("stream already exists"))
	err := natsManager.CreateStreams(runtimeID, versionName, workflows)
	require.Error(t, expectedError, err)
}

func TestCreateStreams_FailsIfNoWorkflowsAreDefined(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)

	const (
		runtimeID   = "test-runtime"
		versionName = "test-version"
	)

	var workflows []*natspb.Workflow

	err := natsManager.CreateStreams(runtimeID, versionName, workflows)
	require.EqualError(t, err, "no workflows defined")
}

func TestGetVersionNatsConfig(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)

	const (
		runtimeID          = "test-runtime"
		versionName        = "test-version"
		workflowName       = "test-workflow"
		workflowEntrypoint = "TestWorkflow"
		streamName         = "test-runtime-test-version-TestWorkflow"
		testNode           = "test-node"
		testNodeSubject    = "test-runtime-test-version-TestWorkflow.test-node"
	)

	workflows := []*natspb.Workflow{
		{
			Name:       workflowName,
			Entrypoint: workflowEntrypoint,
			Nodes: []*natspb.Node{
				{
					Name:          testNode,
					Subscriptions: []string{workflowEntrypoint},
				},
			},
		},
	}

	expectedConfiguration := map[string]*natspb.WorkflowNatsConfig{
		workflowName: {
			Stream: streamName,
			Nodes: map[string]*natspb.NodeNatsConfig{
				testNode: {
					Subject:       testNodeSubject,
					Subscriptions: []string{streamName + "." + workflowEntrypoint},
				},
			},
		},
	}

	actual, err := natsManager.GetVersionNatsConfig(runtimeID, versionName, workflows)
	require.Nil(t, err)
	require.EqualValues(t, expectedConfiguration, actual)
}

func TestCreateObjectStore(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)
	var testObjectStore = new(string)

	const (
		runtimeID          = "test-runtime"
		versionName        = "test-version"
		workflowName       = "test-workflow"
		workflowEntrypoint = "TestWorkflow"
		testNode           = "test-node"
		nodeObjectStore    = "testObjectStore"
	)

	*testObjectStore = nodeObjectStore

	ObjectStoreToCreate := fmt.Sprintf("object-store_%s_%s_%s_%s", runtimeID, versionName, workflowName, nodeObjectStore)

	workflows := []*natspb.Workflow{
		{
			Name:       workflowName,
			Entrypoint: workflowEntrypoint,
			Nodes: []*natspb.Node{
				{
					Name:          testNode,
					Subscriptions: nil,
					ObjectStore:   testObjectStore,
				},
			},
		},
	}

	client.EXPECT().CreateObjectStore(ObjectStoreToCreate).Return(nil)
	actualErr := natsManager.CreateObjectStore(runtimeID, versionName, workflows)
	require.Nil(t, actualErr)
}
