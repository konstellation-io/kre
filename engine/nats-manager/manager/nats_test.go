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
					ObjectStore:   nil,
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

	const (
		runtimeID          = "test-runtime"
		versionName        = "test-version"
		streamName         = "test-runtime-test-version-TestWorkflow"
		workflowName       = "test-workflow"
		workflowEntrypoint = "TestWorkflow"
		testNode           = "test-node"
		testNodeSubject    = "test-runtime-test-version-TestWorkflow.test-node"
	)

	var (
		objectStoreToCreate           string
		nodeObjectStore               natspb.Node_ObjectStore
		workflows                     []*natspb.Workflow
		expectedConfiguration, actual map[string]*natspb.WorkflowNatsConfig
		err                           error
	)

	tests := []struct {
		title string
		name  string
		scope natspb.Node_ObjectStoreScope
	}{
		{
			title: "ScopeWorkflow",
			name:  "testObjectStore",
			scope: natspb.Node_SCOPE_WORKFLOW,
		},
		{
			title: "ScopeWorkflow",
			name:  "testObjectStore",
			scope: natspb.Node_SCOPE_PROJECT,
		},
		{
			title: "Empty",
			scope: natspb.Node_SCOPE_PROJECT,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			nodeObjectStore = natspb.Node_ObjectStore{
				Name:  tt.name,
				Scope: tt.scope,
			}

			if tt.scope == natspb.Node_SCOPE_WORKFLOW {
				objectStoreToCreate = fmt.Sprintf("object-store_%s_%s_%s_%s", runtimeID, versionName, workflowName, tt.name)
			} else if tt.scope == natspb.Node_SCOPE_PROJECT {
				objectStoreToCreate = fmt.Sprintf("object-store_%s_%s_%s", runtimeID, versionName, tt.name)
			}

			workflows = []*natspb.Workflow{
				{
					Name:       workflowName,
					Entrypoint: workflowEntrypoint,
					Nodes: []*natspb.Node{
						{
							Name:          testNode,
							Subscriptions: nil,
							ObjectStore:   &nodeObjectStore,
						},
					},
				},
			}

			client.EXPECT().CreateObjectStore(objectStoreToCreate).Return(nil)
			err = natsManager.CreateObjectStore(runtimeID, versionName, workflows)
			require.Nil(t, err)

			expectedConfiguration = map[string]*natspb.WorkflowNatsConfig{
				workflowName: {
					Stream: streamName,
					Nodes: map[string]*natspb.NodeNatsConfig{
						testNode: {
							Subject:       testNodeSubject,
							Subscriptions: []string{},
							ObjectStore:   &objectStoreToCreate,
						},
					},
				},
			}

			actual, err = natsManager.GetVersionNatsConfig(runtimeID, versionName, workflows)
			require.Nil(t, err)
			require.EqualValues(t, expectedConfiguration, actual)
		})
	}
}
