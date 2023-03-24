package validator_test

import (
	"testing"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt/validator"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
)

func TestKrtValidator_Run(t *testing.T) {
	tests := []struct {
		name        string
		krtYaml     *krt.Krt
		wantError   bool
		errorString string
	}{
		{
			name:        "valid workflow validation",
			krtYaml:     NewKrtBuilder().Build(),
			wantError:   false,
			errorString: "",
		},
		{
			name: "fails if some node have no subscriptions",
			krtYaml: NewKrtBuilder().WithWorkflowsNodes([]krt.Node{
				{
					Name:  "test-node",
					Image: "test-image",
					Src:   "test-src",
				},
			}).Build(),
			wantError:   true,
			errorString: "node \"test-node\" requires at least one subscription",
		},
		{
			name: "fails if some workflow hasn't exitpoint defined",
			krtYaml: NewKrtBuilder().WithWorkflows([]krt.Workflow{{
				Name:       "test-workflow",
				Entrypoint: "test-entrypoint",
				Nodes: []krt.Node{{
					Name:          "test-node",
					Image:         "test-image",
					Src:           "test/src",
					GPU:           false,
					Subscriptions: []string{"entrypoint"},
					ObjectStore:   nil,
				}},
			}}).Build(),
			wantError:   true,
			errorString: "missing exitpoint in workflow \"test-workflow\"",
		},
		{
			name:        "fails if exitpoint node doesn't exist in nodes list",
			krtYaml:     NewKrtBuilder().WithWorkflowsExitpoint("inexistent-node").Build(),
			wantError:   true,
			errorString: "exitpoint node \"inexistent-node\" not found in workflow \"valid-workflow\" nodes",
		},
		{
			name: "fails if node name is not unique in workflow",
			krtYaml: NewKrtBuilder().
				WithWorkflowsNodes([]krt.Node{
					{
						Name:          "test-node",
						Image:         "test-image",
						Src:           "test/src",
						Subscriptions: []string{"entrypoint"},
					},
					{
						Name:          "test-node",
						Image:         "test-image-2",
						Src:           "test-2/src",
						Subscriptions: []string{"entrypoint"},
					},
				}).Build(),
			wantError:   true,
			errorString: validator.ErrRepeatedNodeName.Error(),
		},
	}

	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	fieldsValidator := mocks.NewMockFieldsValidator(ctrl)

	mocks.AddLoggerExpects(logger)

	validator := validator.NewKrtValidator(logger, fieldsValidator)

	for _, tc := range tests {
		fieldsValidator.EXPECT().Run(tc.krtYaml).Return(nil)

		t.Run(tc.name, func(t *testing.T) {
			err := validator.Run(tc.krtYaml)
			if tc.wantError {
				assert.EqualError(t, err, tc.errorString)
				return
			}
			assert.Empty(t, err)
		})
		ctrl.Finish()
	}
}
