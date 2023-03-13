package manager_test

import (
	"fmt"
	"reflect"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/entity"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/errors"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/manager"
	"github.com/konstellation-io/kre/engine/nats-manager/mocks"
)

type streamConfigMatcher struct {
	expectedStreamConfig *entity.StreamConfig
}

func newStreamConfigMatcher(expectedStreamConfig *entity.StreamConfig) *streamConfigMatcher {
	return &streamConfigMatcher{
		expectedStreamConfig: expectedStreamConfig,
	}
}

func (m streamConfigMatcher) String() string {
	return fmt.Sprintf("is equal to %v", m.expectedStreamConfig)
}

func (m streamConfigMatcher) Matches(actual interface{}) bool {
	actualCfg, ok := actual.(*entity.StreamConfig)
	if !ok {
		return false
	}

	return reflect.DeepEqual(actualCfg, m.expectedStreamConfig)
}

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
	)

	testNodeSubject := fmt.Sprintf("%s.%s", streamName, testNode)
	testEntrypointSubject := fmt.Sprintf("%s.entrypoint", streamName)

	workflows := []*entity.Workflow{
		NewWorkflowBuilder().
			WithName(workflowName).
			WithEntrypoint(workflowEntrypoint).
			WithNodeName(testNode).
			Build(),
	}

	expectedWorkflowsStreamsCfg := entity.WorkflowsStreamsConfig{
		workflowName: &entity.StreamConfig{
			Stream: streamName,
			Nodes: entity.NodesStreamConfig{
				testNode: entity.NodeStreamConfig{
					Subject:       testNodeSubject,
					Subscriptions: []string{},
				},
			},
			EntrypointSubject: testEntrypointSubject,
		},
	}

	customMatcher := newStreamConfigMatcher(expectedWorkflowsStreamsCfg[workflowName])

	client.EXPECT().CreateStream(customMatcher).Return(nil)
	workflowsStreamsCfg, actualErr := natsManager.CreateStreams(runtimeID, versionName, workflows)
	assert.Nil(t, actualErr)

	assert.Equal(t, expectedWorkflowsStreamsCfg, workflowsStreamsCfg)
}

func TestCreateStreams_ClientFails(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)

	const (
		runtimeID          = "test-runtime"
		versionName        = "test-version"
		workflowName       = "test-workflow"
		workflowEntrypoint = "TestWorkflow"
		testNode           = "test-node"
	)

	workflows := []*entity.Workflow{
		NewWorkflowBuilder().
			WithName(workflowName).
			WithEntrypoint(workflowEntrypoint).
			WithNodeName(testNode).
			Build(),
	}

	expectedError := fmt.Errorf("stream already exists")

	client.EXPECT().CreateStream(gomock.Any()).Return(fmt.Errorf("stream already exists"))
	workflowsStreamsConfig, err := natsManager.CreateStreams(runtimeID, versionName, workflows)
	assert.Error(t, expectedError, err)
	assert.Nil(t, workflowsStreamsConfig)
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

	var workflows []*entity.Workflow

	_, err := natsManager.CreateStreams(runtimeID, versionName, workflows)
	assert.EqualError(t, err, "no workflows defined")
}

//
//func TestGetVersionNatsConfig(t *testing.T) {
//	ctrl := gomock.NewController(t)
//
//	logger := mocks.NewMockLogger(ctrl)
//	client := mocks.NewMockClient(ctrl)
//	natsManager := manager.NewNatsManager(logger, client)
//
//	const (
//		runtimeID          = "test-runtime"
//		versionName        = "test-version"
//		workflowName       = "test-workflow"
//		workflowEntrypoint = "TestWorkflow"
//		entrypointNodeName = "entrypoint-node"
//		streamName         = "test-runtime-test-version-TestWorkflow"
//		testNode           = "test-node"
//		testNodeSubject    = "test-runtime-test-version-TestWorkflow.test-node"
//	)
//
//	testCases := []struct {
//		name                  string
//		workflows             []*entity.Workflow
//		expectedConfiguration map[string]*entity.WorkflowNatsConfig
//		wantError             bool
//	}{
//		{
//			name: "Workflow with no object store",
//			workflows: []*entity.Workflow{
//				NewWorkflowBuilder().
//					WithName(workflowName).
//					WithEntrypoint(workflowEntrypoint).
//					WithNodes(
//						[]*entity.Node{
//							{
//								Name:          testNode,
//								Subscriptions: []string{entrypointNodeName},
//							},
//						}).
//					Build(),
//			},
//			expectedConfiguration: map[string]*entity.WorkflowNatsConfig{
//				workflowName: {
//					Stream: streamName,
//					Nodes: map[string]*natspb.NodeNatsConfig{
//						testNode: {
//							Subject:       testNodeSubject,
//							Subscriptions: []string{fmt.Sprintf("%s.%s", streamName, entrypointNodeName)},
//						},
//					},
//				},
//			},
//			wantError: false,
//		},
//	}
//
//	for _, tc := range testCases {
//		t.Run(tc.name, func(t *testing.T) {
//			workflowConfig, err := natsManager.GetVersionNatsConfig(runtimeID, versionName, tc.workflows)
//			if tc.wantError {
//				assert.Error(t, err)
//				return
//			}
//			assert.Equal(t, tc.expectedConfiguration, workflowConfig)
//		})
//	}
//}
//
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
		workflows            []*entity.Workflow
		expectedObjectStores []string
		wantError            bool
		wantedError          error
		clientError          bool
	}{
		{
			name: "Object store with project scope",
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  testObjectStore,
							Scope: entity.ScopeProject,
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
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  testObjectStore,
							Scope: entity.ScopeWorkflow,
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
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&entity.ObjectStore{
							Scope: entity.ScopeWorkflow,
						},
					).
					Build(),
			},
			expectedObjectStores: nil,
			wantError:            true,
			wantedError:          errors.ErrInvalidObjectStoreName,
		},
		{
			name: "Invalid object store scope",
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  testObjectStore,
							Scope: -1,
						},
					).
					Build(),
			},
			expectedObjectStores: nil,
			wantError:            true,
			wantedError:          errors.ErrInvalidObjectStoreScope,
		},
		{
			name: "Node without object store",
			workflows: []*entity.Workflow{
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
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  testObjectStore,
							Scope: entity.ScopeWorkflow,
						},
					).
					Build(),
				NewWorkflowBuilder().
					WithName("another-workflow").
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  testObjectStore,
							Scope: entity.ScopeWorkflow,
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
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  testObjectStore,
							Scope: entity.ScopeProject,
						},
					).
					Build(),
				NewWorkflowBuilder().
					WithName("another-workflow").
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  testObjectStore,
							Scope: entity.ScopeProject,
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
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  testObjectStore,
							Scope: entity.ScopeProject,
						},
					).
					Build(),
				NewWorkflowBuilder().
					WithName("another-workflow").
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  "another-object-store",
							Scope: entity.ScopeProject,
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
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodes(
						[]*entity.Node{
							{
								Name: "test-node-1",
								ObjectStore: &entity.ObjectStore{
									Name:  testObjectStore,
									Scope: entity.ScopeWorkflow,
								},
							},
							{
								Name: "test-node-2",
								ObjectStore: &entity.ObjectStore{
									Name:  testObjectStore,
									Scope: entity.ScopeWorkflow,
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
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodes(
						[]*entity.Node{
							{
								Name: "test-node-1",
								ObjectStore: &entity.ObjectStore{
									Name:  testObjectStore,
									Scope: entity.ScopeWorkflow,
								},
							},
							{
								Name: "test-node-2",
								ObjectStore: &entity.ObjectStore{
									Name:  "another-object-store",
									Scope: entity.ScopeWorkflow,
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
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodes(
						[]*entity.Node{
							{
								Name: "test-node-1",
								ObjectStore: &entity.ObjectStore{
									Name:  testObjectStore,
									Scope: entity.ScopeProject,
								},
							},
							{
								Name: "test-node-2",
								ObjectStore: &entity.ObjectStore{
									Name:  testObjectStore,
									Scope: entity.ScopeProject,
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
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodes(
						[]*entity.Node{
							{
								Name: "test-node-1",
								ObjectStore: &entity.ObjectStore{
									Name:  testObjectStore,
									Scope: entity.ScopeProject,
								},
							},
							{
								Name: "test-node-2",
								ObjectStore: &entity.ObjectStore{
									Name:  "another-object-store",
									Scope: entity.ScopeProject,
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

			_, err := natsManager.CreateObjectStores(testRuntimeID, testVersionName, tc.workflows)
			if tc.wantError {
				assert.ErrorIs(t, err, tc.wantedError)
				return
			}
			//assert.NotNil(t, workflowsObjectStoresConfig)
			assert.Nil(t, err)
		})
	}
}
