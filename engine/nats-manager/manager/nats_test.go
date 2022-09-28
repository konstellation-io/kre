package manager_test

import (
	"fmt"
	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/engine/nats-manager/manager"
	"github.com/konstellation-io/kre/engine/nats-manager/mocks"
	"github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestCreateStreams(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

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
		entrypointSubject  = "test-runtime-test-version-TestWorkflow.entrypoint"
	)

	workflows := []*natspb.Workflow{
		{
			Name:       workflowName,
			Entrypoint: workflowEntrypoint,
			Nodes:      []string{testNode},
		},
	}

	expected := map[string]*natspb.StreamInfo{
		workflowName: {
			Stream: streamName,
			NodesSubjects: map[string]string{
				testNode:     testNodeSubject,
				"entrypoint": entrypointSubject,
			},
		},
	}

	client.EXPECT().CreateStream(streamName, []string{entrypointSubject, testNodeSubject}).Return(nil)
	actual, err := natsManager.CreateStreams(runtimeID, versionName, workflows)
	require.Nil(t, err)
	require.EqualValues(t, expected, actual)
}

func TestCreateStreams_ClientFails(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

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
		entrypointSubject  = "test-runtime-test-version-TestWorkflow.entrypoint"
	)

	workflows := []*natspb.Workflow{
		{
			Name:       workflowName,
			Entrypoint: workflowEntrypoint,
			Nodes:      []string{testNode},
		},
	}

	expectedError := fmt.Errorf("stream already exists")

	client.EXPECT().CreateStream(streamName, []string{entrypointSubject, testNodeSubject}).Return(fmt.Errorf("stream already exists"))
	res, err := natsManager.CreateStreams(runtimeID, versionName, workflows)
	require.Error(t, expectedError, err)
	require.Nil(t, res)
}

func TestCreateStreams_FailsIfNoWorkflowsAreDefined(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	logger := mocks.NewMockLogger(ctrl)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)

	const (
		runtimeID   = "test-runtime"
		versionName = "test-version"
	)

	var workflows []*natspb.Workflow

	res, err := natsManager.CreateStreams(runtimeID, versionName, workflows)
	require.EqualError(t, err, "no workflows defined")
	require.Nil(t, res)
}
