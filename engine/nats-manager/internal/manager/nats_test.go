package manager_test

import (
	"fmt"
	"reflect"
	"regexp"
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

func TestCreateDeleteStreams(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	mocks.AddLoggerExpects(logger)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)

	const (
		testRuntimeID          = "test-runtime"
		testVersionName        = "test-version"
		testWorkflowName       = "test-workflow"
		testWorkflowEntrypoint = "TestWorkflow"
		testStreamName         = "test-runtime-test-version-TestWorkflow"
		testNode               = "test-node"
	)

	testNodeSubject := fmt.Sprintf("%s.%s", testStreamName, testNode)
	testEntrypointSubject := fmt.Sprintf("%s.entrypoint", testStreamName)

	workflows := []*entity.Workflow{
		NewWorkflowBuilder().
			WithName(testWorkflowName).
			WithEntrypoint(testWorkflowEntrypoint).
			WithNodeName(testNode).
			Build(),
	}

	expectedWorkflowsStreamsCfg := entity.WorkflowsStreamsConfig{
		testWorkflowName: &entity.StreamConfig{
			Stream: testStreamName,
			Nodes: entity.NodesStreamConfig{
				testNode: entity.NodeStreamConfig{
					Subject:       testNodeSubject,
					Subscriptions: []string{},
				},
			},
			EntrypointSubject: testEntrypointSubject,
		},
	}

	customMatcher := newStreamConfigMatcher(expectedWorkflowsStreamsCfg[testWorkflowName])

	client.EXPECT().CreateStream(customMatcher).Return(nil)
	workflowsStreamsCfg, err := natsManager.CreateStreams(testRuntimeID, testVersionName, workflows)
	assert.Nil(t, err)

	assert.Equal(t, expectedWorkflowsStreamsCfg, workflowsStreamsCfg)

	client.EXPECT().GetStreamsNames().Return([]string{testStreamName})
	logger.EXPECT().Debugf("Obtained stream name: %s", testStreamName).MaxTimes(1)
	client.EXPECT().DeleteStream(testStreamName).Return(nil)
	err = natsManager.DeleteStreams(testRuntimeID, testVersionName)
	assert.Nil(t, err)
}

func TestCreateStreams_ClientFails(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	mocks.AddLoggerExpects(logger)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)

	const (
		testRuntimeID          = "test-runtime"
		testVersionName        = "test-version"
		testWorkflowName       = "test-workflow"
		testWorkflowEntrypoint = "TestWorkflow"
		testNode               = "test-node"
	)

	workflows := []*entity.Workflow{
		NewWorkflowBuilder().
			WithName(testWorkflowName).
			WithEntrypoint(testWorkflowEntrypoint).
			WithNodeName(testNode).
			Build(),
	}

	expectedError := fmt.Errorf("stream already exists")

	client.EXPECT().CreateStream(gomock.Any()).Return(fmt.Errorf("stream already exists"))
	workflowsStreamsConfig, err := natsManager.CreateStreams(testRuntimeID, testVersionName, workflows)
	assert.Error(t, expectedError, err)
	assert.Nil(t, workflowsStreamsConfig)
}

func TestCreateStreams_FailsIfNoWorkflowsAreDefined(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	client := mocks.NewMockClient(ctrl)
	natsManager := manager.NewNatsManager(logger, client)

	const (
		testRuntimeID   = "test-runtime"
		testVersionName = "test-version"
	)

	var workflows []*entity.Workflow

	_, err := natsManager.CreateStreams(testRuntimeID, testVersionName, workflows)
	assert.EqualError(t, err, "no workflows defined")
}

func TestCreateDeleteObjectStore(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	mocks.AddLoggerExpects(logger)
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
		expectInfoLog        bool
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
			expectInfoLog:        false,
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
			wantError:     false,
			wantedError:   nil,
			expectInfoLog: false,
		},
		{
			name: "Invalid object store name",
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithName(testWorkflowName).
					WithNodeObjectStore(
						&entity.ObjectStore{
							Name:  "",
							Scope: entity.ScopeWorkflow,
						},
					).
					Build(),
			},
			expectedObjectStores: nil,
			wantError:            true,
			wantedError:          errors.ErrInvalidObjectStoreName,
			expectInfoLog:        false,
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
			expectInfoLog:        false,
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
			expectInfoLog:        true,
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
			wantError:     false,
			wantedError:   nil,
			expectInfoLog: false,
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
			wantError:     false,
			wantedError:   nil,
			expectInfoLog: false,
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
			wantError:     false,
			wantedError:   nil,
			expectInfoLog: false,
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
			wantError:     false,
			wantedError:   nil,
			expectInfoLog: false,
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
			wantError:     false,
			wantedError:   nil,
			expectInfoLog: false,
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
			wantError:     false,
			wantedError:   nil,
			expectInfoLog: false,
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
			wantError:     false,
			wantedError:   nil,
			expectInfoLog: false,
		},
		{
			name: "nats client error",
			workflows: []*entity.Workflow{
				NewWorkflowBuilder().
					WithNodeObjectStore(&entity.ObjectStore{
						Name:  testObjectStore,
						Scope: entity.ScopeWorkflow,
					}).Build()},
			expectedObjectStores: []string{
				fmt.Sprintf("object-store_%s_%s_%s_%s", testRuntimeID, testVersionName, testWorkflowName, testObjectStore),
			},
			wantError:     true,
			wantedError:   fmt.Errorf("nats client error"),
			expectInfoLog: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if tc.expectInfoLog {
				logger.EXPECT().Info("No object stores defined, skipping").MaxTimes(1)
			}
			for _, expectedObjStore := range tc.expectedObjectStores {
				client.EXPECT().CreateObjectStore(expectedObjStore).Return(tc.wantedError)
			}

			_, err := natsManager.CreateObjectStores(testRuntimeID, testVersionName, tc.workflows)
			if tc.wantError {
				assert.ErrorIs(t, err, tc.wantedError)
				return
			}
			assert.Nil(t, err)

			filter := regexp.MustCompile(fmt.Sprintf(fmt.Sprintf("object-store_%s_%s_.*", testRuntimeID, testVersionName)))

			client.EXPECT().GetObjectStoreNames(filter).Return(tc.expectedObjectStores, nil)
			for _, expectedObjStore := range tc.expectedObjectStores {
				client.EXPECT().DeleteObjectStore(expectedObjStore).Return(nil)
			}
			err = natsManager.DeleteObjectStores(testRuntimeID, testVersionName)
			assert.Nil(t, err)
		})
	}
}
