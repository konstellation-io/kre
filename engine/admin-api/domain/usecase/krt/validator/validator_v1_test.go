package validator_test

import (
	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt/validator"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
)

func TestValidatorV1_Run(t *testing.T) {
	tests := []struct {
		name        string
		krtYaml     *krt.Krt
		wantError   bool
		errorString string
	}{
		{
			name:        "valid workflow validation",
			krtYaml:     NewKrtBuilder().V1().Build(),
			wantError:   false,
			errorString: "",
		},
		{
			name: "subscribe field is incompatible with KrtVersion v1",
			krtYaml: NewKrtBuilder().V1().WithNodes([]krt.Node{
				{
					Name:          "test-node",
					Image:         "test-image",
					Src:           "test-src",
					GPU:           false,
					Subscriptions: []string{"node-a"},
				},
			}).Build(),
			wantError:   true,
			errorString: "field Subscriptions in node \"test-node\" is incompatible with version v1",
		},
		{
			name: "workflows nodes field is incompatible with KrtVersion v1",
			krtYaml: NewKrtBuilder().V1().WithWorkflowsNodes([]krt.Node{
				{
					Name:  "node-b",
					Image: "test-image",
					Src:   "test-src",
				},
			}).Build(),
			wantError:   true,
			errorString: "the field \"workflow.nodes\" is incompatible with version v1",
		},
		{
			name:        "workflows sequential definition has at least one node",
			krtYaml:     NewKrtBuilder().V1().WithWorkflowsSequential([]string{}).Build(),
			wantError:   true,
			errorString: "the field \"workflow.sequential\" hasn't nodes defined",
		},
		{
			name:        "fails if exitpoint is defined in krtVersion v1",
			krtYaml:     NewKrtBuilder().V1().WithWorkflowsExitpoint("test-exitpoint").Build(),
			wantError:   true,
			errorString: "the field \"workflow.exitpoint\" is incompatible with version v1",
		},
		{
			name: "fails if workflow.sequential uses a node that is not defined in nodes definition",
			krtYaml: NewKrtBuilder().V1().WithNodes([]krt.Node{{
				Name:  "test-node",
				Image: "test-image",
				Src:   "test/source",
			}}).WithWorkflowsSequential([]string{"inexistent-node"}).Build(),
			wantError:   true,
			errorString: "node \"inexistent-node\" in workflow \"valid-workflow\" not defined in nodes list",
		},
	}

	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	fieldsValidator := mocks.NewMockFieldsValidator(ctrl)

	mocks.AddLoggerExpects(logger)

	validator := validator.NewValidator(logger, fieldsValidator, krt.VersionV1)

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
