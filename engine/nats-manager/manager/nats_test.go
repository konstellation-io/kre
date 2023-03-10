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
		NewWorkflowBuilder().
			WithName(workflowName).
			WithEntrypoint(workflowEntrypoint).
			WithNodeName(testNode).
			Build(),
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
		NewWorkflowBuilder().
			WithName(workflowName).
			WithEntrypoint(workflowEntrypoint).
			WithNodeName(testNode).
			Build(),
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
		entrypointNodeName = "entrypoint-node"
		streamName         = "test-runtime-test-version-TestWorkflow"
		testNode           = "test-node"
		testNodeSubject    = "test-runtime-test-version-TestWorkflow.test-node"
	)

	workflows := []*natspb.Workflow{
		NewWorkflowBuilder().
			WithName(workflowName).
			WithEntrypoint(workflowEntrypoint).
			WithNodeName(testNode).
			WithNodeSubscriptions([]string{entrypointNodeName}).
			Build(),
	}

	expectedConfiguration := map[string]*natspb.WorkflowNatsConfig{
		workflowName: {
			Stream: streamName,
			Nodes: map[string]*natspb.NodeNatsConfig{
				testNode: {
					Subject:       testNodeSubject,
					Subscriptions: []string{fmt.Sprintf("%s.%s", streamName, entrypointNodeName)},
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
		testRuntimeID    = "test-runtime"
		testVersionName  = "test-version"
		testWorkflowName = "test-workflow"
		testObjectStore  = "test-object-store"
	)

	tests := []struct {
		name                 string
		workflows            []*natspb.Workflow
		expectedObjectStores []string
		wantError            bool
		wantedError          error
		clientError          bool
	}{
		{
			name: "ScopeProject",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Name:  testObjectStore,
							Scope: natspb.Node_SCOPE_PROJECT,
						},
					).
					Build(),
			},
			expectedObjectStores: []string{fmt.Sprintf("object-store_%s_%s_%s", testRuntimeID, testVersionName, testObjectStore)},
			wantError:            false,
			wantedError:          nil,
		},
		{
			name: "ScopeWorkflow",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Name:  testObjectStore,
							Scope: natspb.Node_SCOPE_WORKFLOW,
						},
					).
					Build(),
			},
			expectedObjectStores: []string{
				fmt.Sprintf("object-store_%s_%s_%s_%s", testRuntimeID, testVersionName, testWorkflowName, testObjectStore),
			},
			wantError:   false,
			wantedError: nil,
		},
		{
			name: "InvalidName",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Scope: natspb.Node_SCOPE_WORKFLOW,
						},
					).
					Build(),
			},
			expectedObjectStores: nil,
			wantError:            true,
			wantedError:          manager.ErrInvalidObjectStoreName,
		},
		{
			name: "InvalidScope",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Name:  testObjectStore,
							Scope: -1,
						},
					).
					Build(),
			},
			expectedObjectStores: nil,
			wantError:            true,
			wantedError:          manager.ErrInvalidObjectStoreScope,
		},
		{
			name: "NoObjectStoreToConfigure",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					Build(),
			},
			expectedObjectStores: nil,
			wantError:            false,
			wantedError:          nil,
		},
		{
			name: "MultipleWorkflowsSample",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Name:  testObjectStore,
							Scope: natspb.Node_SCOPE_WORKFLOW,
						},
					).
					Build(),
				NewWorkflowBuilder().
					WithName("another-workflow").
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Name:  testObjectStore,
							Scope: natspb.Node_SCOPE_WORKFLOW,
						},
					).
					Build(),
			},
			expectedObjectStores: []string{
				fmt.Sprintf("object-store_%s_%s_%s_%s", testRuntimeID, testVersionName, testWorkflowName, testObjectStore),
				fmt.Sprintf("object-store_%s_%s_another-workflow_%s", testRuntimeID, testVersionName, testObjectStore),
			},
			wantError:   false,
			wantedError: nil,
		},
		{
			name: "MultipleNodesInWorkflowSample",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodes(
						[]*natspb.Node{
							{
								Name: "test-node-1",
								ObjectStore: &natspb.Node_ObjectStore{
									Name:  testObjectStore,
									Scope: natspb.Node_SCOPE_WORKFLOW,
								},
							},
							{
								Name: "test-node-2",
								ObjectStore: &natspb.Node_ObjectStore{
									Name:  testObjectStore,
									Scope: natspb.Node_SCOPE_WORKFLOW,
								},
							},
						},
					).
					Build(),
			},
			expectedObjectStores: []string{
				fmt.Sprintf("object-store_%s_%s_%s_%s", testRuntimeID, testVersionName, testWorkflowName, testObjectStore),
				fmt.Sprintf("object-store_%s_%s_%s_%s", testRuntimeID, testVersionName, testWorkflowName, testObjectStore),
			},
			wantError:   false,
			wantedError: nil,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			for _, expecterObjStore := range tc.expectedObjectStores {
				client.EXPECT().CreateObjectStore(expecterObjStore).Return(tc.wantedError)
			}
			err := natsManager.CreateObjectStore(testRuntimeID, testVersionName, tc.workflows)
			if tc.wantError {
				require.ErrorIs(t, err, tc.wantedError)
				return
			}
			require.Nil(t, err)
		})
	}
}
