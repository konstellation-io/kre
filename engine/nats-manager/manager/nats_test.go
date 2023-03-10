package manager_test

import (
	"fmt"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"

	"github.com/konstellation-io/kre/engine/nats-manager/manager"
	"github.com/konstellation-io/kre/engine/nats-manager/mocks"
	"github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"
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
	assert.Nil(t, actualErr)
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
	assert.Error(t, expectedError, err)
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
	assert.EqualError(t, err, "no workflows defined")
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

	testCases := []struct {
		name                  string
		workflows             []*natspb.Workflow
		expectedConfiguration map[string]*natspb.WorkflowNatsConfig
		wantError             bool
	}{
		{
			name: "Workflow with no object store",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(workflowName).
					WithEntrypoint(workflowEntrypoint).
					WithNodes(
						[]*natspb.Node{
							{
								Name:          testNode,
								Subscriptions: []string{entrypointNodeName},
							},
						}).
					Build(),
			},
			expectedConfiguration: map[string]*natspb.WorkflowNatsConfig{
				workflowName: {
					Stream: streamName,
					Nodes: map[string]*natspb.NodeNatsConfig{
						testNode: {
							Subject:       testNodeSubject,
							Subscriptions: []string{fmt.Sprintf("%s.%s", streamName, entrypointNodeName)},
						},
					},
				},
			},
			wantError: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			workflowConfig, err := natsManager.GetVersionNatsConfig(runtimeID, versionName, tc.workflows)
			if tc.wantError {
				assert.Error(t, err)
				return
			}
			assert.Equal(t, tc.expectedConfiguration, workflowConfig)
		})
	}
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
			name: "Object store with project scope",
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
			name: "Object store with workflow scope",
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
			name: "Invalid object store name",
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
			name: "Invalid object store scope",
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
			name: "Node without object store",
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
			name: "Multiple workflows with different workflow scoped object store",
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
			name: "Multiple workflows with the same project scoped object store",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Name:  testObjectStore,
							Scope: natspb.Node_SCOPE_PROJECT,
						},
					).
					Build(),
				NewWorkflowBuilder().
					WithName("another-workflow").
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Name:  testObjectStore,
							Scope: natspb.Node_SCOPE_PROJECT,
						},
					).
					Build(),
			},
			expectedObjectStores: []string{
				fmt.Sprintf("object-store_%s_%s_%s", testRuntimeID, testVersionName, testObjectStore),
				fmt.Sprintf("object-store_%s_%s_%s", testRuntimeID, testVersionName, testObjectStore),
			},
			wantError:   false,
			wantedError: nil,
		},
		{
			name: "Multiple workflows with different project scoped object store",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Name:  testObjectStore,
							Scope: natspb.Node_SCOPE_PROJECT,
						},
					).
					Build(),
				NewWorkflowBuilder().
					WithName("another-workflow").
					WithNodeObjectStore(
						&natspb.Node_ObjectStore{
							Name:  "another-object-store",
							Scope: natspb.Node_SCOPE_PROJECT,
						},
					).
					Build(),
			},
			expectedObjectStores: []string{
				fmt.Sprintf("object-store_%s_%s_%s", testRuntimeID, testVersionName, testObjectStore),
				fmt.Sprintf("object-store_%s_%s_another-object-store", testRuntimeID, testVersionName),
			},
			wantError:   false,
			wantedError: nil,
		},
		{
			name: "Multiple nodes in workflow with same workflow scoped object store",
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
		{
			name: "Multiple nodes in workflow with different workflow scoped object store",
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
									Name:  "another-object-store",
									Scope: natspb.Node_SCOPE_WORKFLOW,
								},
							},
						},
					).
					Build(),
			},
			expectedObjectStores: []string{
				fmt.Sprintf("object-store_%s_%s_%s_%s", testRuntimeID, testVersionName, testWorkflowName, testObjectStore),
				fmt.Sprintf("object-store_%s_%s_%s_another-object-store", testRuntimeID, testVersionName, testWorkflowName),
			},
			wantError:   false,
			wantedError: nil,
		},
		{
			name: "Multiple nodes in workflow with same project scoped object store",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodes(
						[]*natspb.Node{
							{
								Name: "test-node-1",
								ObjectStore: &natspb.Node_ObjectStore{
									Name:  testObjectStore,
									Scope: natspb.Node_SCOPE_PROJECT,
								},
							},
							{
								Name: "test-node-2",
								ObjectStore: &natspb.Node_ObjectStore{
									Name:  testObjectStore,
									Scope: natspb.Node_SCOPE_PROJECT,
								},
							},
						},
					).
					Build(),
			},
			expectedObjectStores: []string{
				fmt.Sprintf("object-store_%s_%s_%s", testRuntimeID, testVersionName, testObjectStore),
				fmt.Sprintf("object-store_%s_%s_%s", testRuntimeID, testVersionName, testObjectStore),
			},
			wantError:   false,
			wantedError: nil,
		},
		{
			name: "Multiple nodes in workflow with different project scoped object store",
			workflows: []*natspb.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodes(
						[]*natspb.Node{
							{
								Name: "test-node-1",
								ObjectStore: &natspb.Node_ObjectStore{
									Name:  testObjectStore,
									Scope: natspb.Node_SCOPE_PROJECT,
								},
							},
							{
								Name: "test-node-2",
								ObjectStore: &natspb.Node_ObjectStore{
									Name:  "another-object-store",
									Scope: natspb.Node_SCOPE_PROJECT,
								},
							},
						},
					).
					Build(),
			},
			expectedObjectStores: []string{
				fmt.Sprintf("object-store_%s_%s_%s", testRuntimeID, testVersionName, testObjectStore),
				fmt.Sprintf("object-store_%s_%s_another-object-store", testRuntimeID, testVersionName),
			},
			wantError:   false,
			wantedError: nil,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			for _, expectedObjStore := range tc.expectedObjectStores {
				client.EXPECT().CreateObjectStore(expectedObjStore).Return(tc.wantedError)
			}
			err := natsManager.CreateObjectStore(testRuntimeID, testVersionName, tc.workflows)
			if tc.wantError {
				assert.ErrorIs(t, err, tc.wantedError)
				return
			}
			assert.Nil(t, err)
		})
	}
}
